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
        const list = ul(li("one"), li("two"));
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
        const el = div({ innerHTML: "<b>bad</b>" }, "safe");
        return { hasB: el.querySelector("b") !== null, text: el.textContent };
      });
      assertEquals(result, { hasB: false, text: "safe" });
    });

    await t.step("builds text and comments", async () => {
      const result = await page.evaluate(async () => {
        const { text, comment } = await import("/dom/main.js");
        return { text: text("hi").nodeType, comment: comment("c").nodeType };
      });
      assertEquals(result, { text: 3, comment: 8 });
    });

    await t.step("render appends every mountable to the root", async () => {
      const result = await page.evaluate(async () => {
        const { p, render } = await import("/dom/main.js");
        const root = document.createElement("main");
        render([p("one"), p("two")], root);
        return [...root.children].map((c) => c.textContent);
      });
      assertEquals(result, ["one", "two"]);
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

    await t.step(
      "fires handlers for clicks deeply nested in the element",
      async () => {
        const clicks = await page.evaluate(async () => {
          const { button, span, div, render } = await import("/dom/main.js");
          const root = document.createElement("main");
          document.body.append(root);
          let count = 0;
          render(
            [button({ onclick: () => count++ }, div(span("deep")))],
            root,
          );
          root.querySelector("span")?.click();
          return count;
        });
        assertEquals(clicks, 1);
      },
    );

    await t.step(
      "clicks outside the element do not throw or fire it",
      async () => {
        const result = await page.evaluate(async () => {
          const { button, render } = await import("/dom/main.js");
          const root = document.createElement("main");
          document.body.append(root);
          let count = 0;
          render([button({ onclick: () => count++ }, "go")], root);
          const outside = document.createElement("div");
          root.append(outside);
          const errors: string[] = [];
          const onError = (e: ErrorEvent) => errors.push(e.message);
          window.addEventListener("error", onError);
          outside.click();
          window.removeEventListener("error", onError);
          return { count, errors };
        });
        assertEquals(result, { count: 0, errors: [] });
      },
    );
  } finally {
    await browser.close();
    await server?.kill();
  }
});
