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

    await t.step("exports links, text and figure helpers", async () => {
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

    await t.step("does not allow innerHTML through props", async () => {
      const result = await page.evaluate(async () => {
        const { div } = await import("/dom/main.js");
        const el = div({ innerHTML: "<b>bad</b>" }, "safe");
        return { hasB: el.querySelector("b") !== null, text: el.textContent };
      });
      assertEquals(result, { hasB: false, text: "safe" });
    });

    await t.step(
      "enhance applies props and handlers to an existing element",
      async () => {
        const result = await page.evaluate(async () => {
          const { enhance } = await import("/dom/main.js");
          const existing = document.createElement("button");
          existing.textContent = "go";
          document.body.append(existing);
          let clicks = 0;
          const returned = enhance(existing, {
            id: "enhanced",
            onclick: () => clicks++,
            onmouseenter: () => clicks += 10,
          });
          existing.click();
          existing.dispatchEvent(new Event("mouseenter"));
          return {
            same: returned === existing,
            id: existing.id,
            clicks,
            text: existing.textContent,
          };
        });
        assertEquals(result, {
          same: true,
          id: "enhanced",
          clicks: 11,
          text: "go",
        });
      },
    );

    await t.step(
      "enhance appends children and accepts dataset, class and aria props",
      async () => {
        const result = await page.evaluate(async () => {
          const { enhance, span } = await import("/dom/main.js");
          const existing = document.createElement("div");
          enhance(
            existing,
            {
              dataset: { variant: "info" },
              class: "toast",
              "aria-invalid": "true",
              "data-extra": "1",
            },
            "text ",
            span("child"),
          );
          return {
            variant: existing.dataset.variant,
            extra: existing.dataset.extra,
            className: existing.className,
            aria: existing.getAttribute("aria-invalid"),
            text: existing.textContent,
          };
        });
        assertEquals(result, {
          variant: "info",
          extra: "1",
          className: "toast",
          aria: "true",
          text: "text child",
        });
      },
    );

    await t.step(
      "enhance throws when given something that is not an element",
      async () => {
        const message = await page.evaluate(async () => {
          const { enhance } = await import("/dom/main.js");
          try {
            enhance(null, { id: "x" });
          } catch (err) {
            return (err as Error).message;
          }
          return "";
        });
        assertStringIncludes(message, "Element");
      },
    );

    await t.step(
      "element helpers accept dataset, class and aria props",
      async () => {
        const result = await page.evaluate(async () => {
          const { div } = await import("/dom/main.js");
          const el = div({
            dataset: { a: "1" },
            class: "x y",
            "aria-label": "hi",
          });
          return [el.dataset.a, el.className, el.getAttribute("aria-label")];
        });
        assertEquals(result, ["1", "x y", "hi"]);
      },
    );

    await t.step(
      "passes listener options with [handler, options]",
      async () => {
        const clicks = await page.evaluate(async () => {
          const { enhance, button } = await import("/dom/main.js");
          let count = 0;
          const el = enhance(button("go"), {
            onclick: [() => count++, { once: true }],
          });
          el.click();
          el.click();
          return count;
        });
        assertEquals(clicks, 1);
      },
    );

    await t.step("registers custom events through the on map", async () => {
      const result = await page.evaluate(async () => {
        const { enhance, div } = await import("/dom/main.js");
        const calls: string[] = [];
        const el = enhance(div(), {
          on: {
            "my-event": () => calls.push("custom"),
            click: [() => calls.push("once"), { once: true }],
          },
        });
        el.dispatchEvent(new Event("my-event"));
        el.click();
        el.click();
        return calls;
      });
      assertEquals(result, ["custom", "once"]);
    });

    await t.step("accepts handleEvent objects as listeners", async () => {
      const result = await page.evaluate(async () => {
        const { enhance, div } = await import("/dom/main.js");
        const widget = {
          calls: [] as string[],
          handleEvent(event: Event) {
            this.calls.push(event.type);
          },
        };
        const el = enhance(div(), {
          onclick: widget,
          on: { "my-event": widget, keydown: [widget, { once: true }] },
        });
        el.click();
        el.dispatchEvent(new Event("my-event"));
        el.dispatchEvent(new Event("keydown"));
        el.dispatchEvent(new Event("keydown"));
        return widget.calls;
      });
      assertEquals(result, ["click", "my-event", "keydown"]);
    });

    await t.step("signals and effects drive the DOM", async () => {
      const result = await page.evaluate(async () => {
        const { $state, $effect, $derived, flush, div, enhance } = await import(
          "/dom/main.js"
        );
        const element = div({ className: "element" });
        document.body.append(element);
        const count = $state(0);
        const double = $derived(() => count() * 2);
        $effect(() => {
          element.textContent = `${count()}:${double()}`;
        });
        enhance(element, {
          onclick: () => count((value: number) => value + 1),
        });
        const before = element.textContent;
        element.click();
        element.click();
        flush();
        return [before, element.textContent];
      });
      assertEquals(result, ["0:0", "2:4"]);
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

    await t.step(
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

    await t.step(
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

    await t.step("stopPropagation keeps a click from parents", async () => {
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

    await t.step("render skips empty and boolean entries", async () => {
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
