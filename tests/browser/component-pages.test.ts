import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { chromium } from "playwright";
import { baseURL, startServer } from "./helpers.ts";

Deno.test("Component pages in Chromium", async (t) => {
  const server = await startServer();
  const browser = await chromium.launch({ channel: "chromium" });

  try {
    const page = await browser.newPage();

    await t.step("the list shows every component as a card", async () => {
      await page.goto(`${baseURL}/components/`);
      const cards = page.locator(".component-card");
      assert((await cards.count()) >= 20);
      assertEquals(
        await page.locator(".component-filter [aria-current=page]").innerText(),
        "All",
      );
      await page.locator(".component-card h2 a", { hasText: "Tabs" }).click();
      await page.waitForURL(`${baseURL}/components/tabs/`);
    });

    await t.step("a tag link filters the list", async () => {
      await page.goto(`${baseURL}/components/`);
      const all = await page.locator(".component-card").count();
      await page.locator(".component-filter a", { hasText: "javascript" })
        .click();
      await page.waitForURL(`${baseURL}/components/tags/javascript/`);
      const cards = page.locator(".component-card");
      const count = await cards.count();
      assert(count > 0 && count < all, `${count} of ${all}`);
      for (
        const tags of await cards.locator(".component-tags").allInnerTexts()
      ) {
        assertStringIncludes(tags, "javascript");
      }
      assertEquals(
        await page.locator(".component-filter [aria-current=page]").innerText(),
        "javascript",
      );
      assertStringIncludes(
        await page.locator(".component-count").innerText(),
        `${count} components tagged javascript`,
      );
    });

    await t.step(
      "a component page documents and demos the component",
      async () => {
        await page.goto(`${baseURL}/components/tabs/`);
        const headings = await page.locator(".component-page section > h2")
          .allInnerTexts();
        assertEquals(headings, [
          "Demo",
          "Usage",
          "Accessibility",
          "Custom properties",
          "Source",
        ]);

        // The demo still works inside the layout.
        await page.getByRole("tab", { name: "Two" }).click();
        assertEquals(
          await page.getByRole("tab", { name: "Two" }).getAttribute(
            "aria-selected",
          ),
          "true",
        );

        // Defaults are read from styles.css; descriptions from front matter.
        const row = page.locator(".component-table tbody tr", {
          hasText: "--tabs-gap",
        });
        assertEquals(
          await row.locator("td").allInnerTexts(),
          ["0.25rem", "Space between tabs."],
        );

        assertEquals(
          await page.locator(".component-source summary").allInnerTexts(),
          ["index.html", "styles.css", "tabs.js"],
        );
        const js = page.locator(".component-source").filter({
          has: page.locator("summary", { hasText: /^tabs\.js$/ }),
        });
        await js.locator("summary").click();
        assertStringIncludes(
          await js.locator("pre").innerText(),
          "export function initTabs",
        );
      },
    );

    await t.step("previous and next links walk the list in order", async () => {
      await page.goto(`${baseURL}/components/tabs/`);
      assertEquals(
        await page.locator(".component-pager a[rel=prev]").getAttribute("href"),
        "/components/table/",
      );
      await page.locator(".component-pager a[rel=next]").click();
      await page.waitForURL(`${baseURL}/components/theme-toggle/`);
    });

    await t.step("the global nav marks the Components section", async () => {
      await page.goto(`${baseURL}/components/tabs/`);
      assertEquals(
        await page.locator("#global-nav strong").innerText(),
        "Components",
      );
      assertEquals(
        await page.locator("#global-nav [aria-current=page]").count(),
        0,
      );
    });

    await t.step(
      "pages without JavaScript or custom properties skip those sections",
      async () => {
        await page.goto(`${baseURL}/components/visually-hidden/`);
        const headings = await page.locator(".component-page section > h2")
          .allInnerTexts();
        assertEquals(headings, ["Demo", "Usage", "Accessibility", "Source"]);
        assertEquals(
          await page.locator(".component-source summary").allInnerTexts(),
          ["index.html", "styles.css"],
        );
      },
    );
  } finally {
    await browser.close();
    await server?.kill();
  }
});
