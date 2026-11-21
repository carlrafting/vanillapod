import { assertEquals, assertStringIncludes } from "@std/assert";
import { chromium } from "playwright";
import { baseURL, startServer, stepWithShot } from "./helpers.ts";

Deno.test("DOM elements in Chromium", async (t) => {
  const server = await startServer();
  const browser = await chromium.launch({ channel: "chromium" });

  try {
    const page = await browser.newPage();
    await page.goto(`${baseURL}/examples/tasks/`);

    await stepWithShot(t, page, "nests children inside tag helpers", async () => {
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

    await stepWithShot(t, page, "exports links, text and figure helpers", async () => {
      const result = await page.evaluate(async () => {
        const { a, pre, figure, figcaption, strong } = await import(
          "/dom/main.js"
        );
        return [
          a({ href: "#x" }, "link"),
          pre("code"),
          figure(figcaption("caption")),
          strong("bold"),
        ].map((el) => el.tagName);
      });
      assertEquals(result, ["A", "PRE", "FIGURE", "STRONG"]);
    });

    await stepWithShot(t, page, "does not allow innerHTML through props", async () => {
      const result = await page.evaluate(async () => {
        const { div } = await import("/dom/main.js");
        const el = div({ innerHTML: "<b>bad</b>" }, "safe");
        return { hasB: el.querySelector("b") !== null, text: el.textContent };
      });
      assertEquals(result, { hasB: false, text: "safe" });
    });

    await stepWithShot(t, page, "builds text and comments", async () => {
      const result = await page.evaluate(async () => {
        const { text, comment } = await import("/dom/main.js");
        return { text: text("hi").nodeType, comment: comment("c").nodeType };
      });
      assertEquals(result, { text: 3, comment: 8 });
    });

    await stepWithShot(t, page, "render appends every mountable to the root", async () => {
      const result = await page.evaluate(async () => {
        const { p, render } = await import("/dom/main.js");
        const root = document.createElement("main");
        render([p("one"), p("two")], root);
        return [...root.children].map((c) => c.textContent);
      });
      assertEquals(result, ["one", "two"]);
    });

    await stepWithShot(t, page, "render throws without a root", async () => {
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

    await stepWithShot(t, page, "fires handlers for clicks on nested elements", async () => {
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

    await stepWithShot(t, page, 
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

    await stepWithShot(t, page, 
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

    await stepWithShot(t, page, 
      "fires handlers on elements added without render",
      async () => {
        const clicks = await page.evaluate(async () => {
          const { button, render } = await import("/dom/main.js");
          const root = document.createElement("main");
          document.body.append(root);
          let count = 0;
          render([], root);
          root.append(button({ onclick: () => count++ }, "go"));
          root.querySelector("button")?.click();
          return count;
        });
        assertEquals(clicks, 1);
      },
    );

    await stepWithShot(t, page, 
      "keeps handlers when rendering into separate roots",
      async () => {
        const clicks = await page.evaluate(async () => {
          const { button, p, render } = await import("/dom/main.js");
          const first = document.createElement("main");
          const second = document.createElement("main");
          document.body.append(first, second);
          let count = 0;
          const action = button({ onclick: () => count++ }, "go");
          render([p("first")], first);
          render([action], second);
          action.click();
          return count;
        });
        assertEquals(clicks, 1);
      },
    );

    await stepWithShot(t, page, "stopPropagation keeps a click from parents", async () => {
      const result = await page.evaluate(async () => {
        const { button, div, render } = await import("/dom/main.js");
        const root = document.createElement("main");
        document.body.append(root);
        const calls: string[] = [];
        render([
          div(
            { onclick: () => calls.push("parent") },
            button({
              onclick: (event: Event) => {
                event.stopPropagation();
                calls.push("child");
              },
            }, "go"),
          ),
        ], root);
        root.querySelector("button")?.click();
        return calls;
      });
      assertEquals(result, ["child"]);
    });

    await stepWithShot(t, page, "render skips empty and boolean entries", async () => {
      const result = await page.evaluate(async () => {
        const { p, render } = await import("/dom/main.js");
        const root = document.createElement("main");
        render([false, null, undefined, true, p("shown"), 0], root);
        return root.textContent;
      });
      assertEquals(result, "shown0");
    });
  } finally {
    await browser.close();
    await server?.kill();
  }
});
