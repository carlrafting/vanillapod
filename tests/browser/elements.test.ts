import { assertEquals, assertStringIncludes } from "@std/assert";
import { chromium } from "playwright";
import { baseURL, startServer } from "./helpers.ts";

Deno.test("DOM elements in Chromium", async (t) => {
  const server = await startServer();
  const browser = await chromium.launch({ channel: "chromium" });

  try {
    const page = await browser.newPage();
    await page.goto(`${baseURL}/examples/tasks/`);

    await t.step("nests children inside tag helpers", async () => {
      const result = await page.evaluate(async () => {
        const { ul, li } = await import("/dom/main.js");
        const list = ul(li("one"), li("two")).firstElementChild;
        return {
          count: list.children.length,
          last: list.children[1].textContent,
        };
      });
      assertEquals(result, { count: 2, last: "two" });
    });

    await t.step("does not allow innerHTML through props", async () => {
      const result = await page.evaluate(async () => {
        const { div } = await import("/dom/main.js");
        const el = div({ innerHTML: "<b>bad</b>" }, "safe").firstElementChild;
        return { hasB: el.querySelector("b") !== null, text: el.textContent };
      });
      assertEquals(result, { hasB: false, text: "safe" });
    });

    await t.step("passes a callback a proxied element", async () => {
      const text = await page.evaluate(async () => {
        const { p } = await import("/dom/main.js");
        return p((node: HTMLElement) => {
          node.textContent = "from callback";
        }).firstElementChild.textContent;
      });
      assertEquals(text, "from callback");
    });

    await t.step("builds fragments, text and comments", async () => {
      const result = await page.evaluate(async () => {
        const { fragment, p, text, comment } = await import("/dom/main.js");
        return {
          children: fragment(p("a"), p("b")).children.length,
          text: text("hi").nodeType,
          comment: comment("c").nodeType,
        };
      });
      assertEquals(result, { children: 2, text: 3, comment: 8 });
    });

    await t.step("render appends and destroy removes by position", async () => {
      const result = await page.evaluate(async () => {
        const { p, render } = await import("/dom/main.js");
        const root = document.createElement("main");
        const destroy = render([p("one"), p("two")], root);
        const before = root.children.length;
        destroy(0);
        return {
          before,
          after: root.children.length,
          remaining: root.children[0]?.textContent,
        };
      });
      assertEquals(result, { before: 2, after: 1, remaining: "two" });
    });

    await t.step("render throws without a root", async () => {
      const message = await page.evaluate(async () => {
        const { p, render } = await import("/dom/main.js");
        try {
          render([p("x")], null);
        } catch (err) {
          return (err as Error).message;
        }
        return "";
      });
      assertStringIncludes(message, "root element");
    });

    await t.step("fires handlers for clicks on nested elements", async () => {
      const clicks = await page.evaluate(async () => {
        const { button, span, render } = await import("/dom/main.js");
        const root = document.createElement("main");
        document.body.append(root);
        let count = 0;
        render([button({ onclick: () => count++ }, span("go"))], root);
        root.querySelector("span")?.click();
        return count;
      });
      assertEquals(clicks, 1);
    });
  } finally {
    await browser.close();
    await server?.kill();
  }
});
