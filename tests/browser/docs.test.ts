import { assert, assertEquals } from "@std/assert";
import { chromium } from "playwright";
import { baseURL, startServer } from "./helpers.ts";

const pages = [
  ["/docs/", "Introduction"],
  ["/docs/getting-started/", "Getting started"],
  ["/docs/elements/", "Creating elements"],
  ["/docs/enhancing-markup/", "Enhancing markup"],
  ["/docs/state/", "State and effects"],
  ["/docs/using-components/", "Using components"],
  ["/docs/contributing/", "Contributing"],
];

Deno.test("Docs pages in Chromium", async (t) => {
  const server = await startServer();
  const browser = await chromium.launch({ channel: "chromium" });

  try {
    const page = await browser.newPage();

    await t.step("the sidebar lists every page in order", async () => {
      await page.goto(`${baseURL}/docs/`);
      const links = page.locator(".docs-nav a");
      assertEquals(await links.allInnerTexts(), pages.map(([, title]) => title));
      assertEquals(
        await page.locator(".docs-nav [aria-current=page]").innerText(),
        "Introduction",
      );
    });

    await t.step("Next walks through every page", async () => {
      await page.goto(`${baseURL}/docs/`);
      for (const [index, [path, title]] of pages.entries()) {
        await page.waitForURL(`${baseURL}${path}`);
        assertEquals(await page.locator("header h1").innerText(), title);
        assertEquals(
          await page.locator(".docs-nav [aria-current=page]").innerText(),
          title,
        );
        // Every page after the introduction has code examples, and the
        // JavaScript ones are highlighted.
        if (index > 0) {
          assert(
            await page.locator(".docs-content pre code").count() > 0,
            `${path} has code examples`,
          );
        }
        const js = page.locator(".docs-content code.language-js");
        if (await js.count() > 0) {
          assert(
            await js.locator(".token").count() > 0,
            `${path} highlights its JavaScript`,
          );
        }
        const next = page.locator(".docs-pager a[rel=next]");
        if (index < pages.length - 1) await next.click();
        else assertEquals(await next.count(), 0);
      }
    });

    await t.step("links between docs pages resolve", async () => {
      const hrefs = new Set<string>();
      for (const [path] of pages) {
        await page.goto(`${baseURL}${path}`);
        for (
          const href of await page.locator(".docs-content a[href^='/']")
            .evaluateAll((links) =>
              links.map((link) => link.getAttribute("href")!.split("#")[0])
            )
        ) hrefs.add(href);
      }
      for (const href of hrefs) {
        const response = await fetch(`${baseURL}${href}`);
        await response.body?.cancel();
        assert(response.ok, `${href} returned ${response.status}`);
      }
    });
  } finally {
    await browser.close();
    await server?.kill();
  }
});
