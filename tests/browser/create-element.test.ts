import { assertEquals } from "@std/assert";
import { chromium } from "playwright";
import { baseURL, startServer } from "./helpers.ts";

Deno.test("buildElement props in Chromium", async (t) => {
  const server = await startServer();
  const browser = await chromium.launch({ channel: "chromium" });

  try {
    const page = await browser.newPage();
    await page.goto(`${baseURL}/examples/tasks/`);

    await t.step("applies classList and classNames", async () => {
      const result = await page.evaluate(async () => {
        const { buildElement } = await import("/dom/src/dom.js");
        const fromList = buildElement("div", { classList: ["a", "b"] }).element;
        const fromNames = buildElement("div", { classNames: ["c"] }).element;
        return {
          list: fromList.className,
          names: fromNames.className,
        };
      });
      assertEquals(result, { list: "a b", names: "c" });
    });

    await t.step("applies data props as dataset entries", async () => {
      const result = await page.evaluate(async () => {
        const { buildElement } = await import("/dom/src/dom.js");
        const el = buildElement("div", { data: { taskId: "42", kind: "todo" } })
          .element;
        return { taskId: el.dataset.taskId, kind: el.dataset.kind };
      });
      assertEquals(result, { taskId: "42", kind: "todo" });
    });

    await t.step("sets attributes from attrs and attributes", async () => {
      const result = await page.evaluate(async () => {
        const { buildElement } = await import("/dom/src/dom.js");
        const fromAttrs = buildElement("input", {
          attrs: { type: "checkbox", "aria-label": "Done" },
        }).element;
        const fromAttributes = buildElement("input", {
          attributes: { name: "task" },
        }).element;
        return {
          type: fromAttrs.getAttribute("type"),
          label: fromAttrs.getAttribute("aria-label"),
          name: fromAttributes.getAttribute("name"),
        };
      });
      assertEquals(result, {
        type: "checkbox",
        label: "Done",
        name: "task",
      });
    });

    await t.step("sets element properties from props", async () => {
      const result = await page.evaluate(async () => {
        const { buildElement } = await import("/dom/src/dom.js");
        const el =
          buildElement("input", { props: { value: "hello", hidden: true } })
            .element;
        return { value: el.value, hidden: el.hidden };
      });
      assertEquals(result, { value: "hello", hidden: true });
    });

    await t.step(
      "normalizes on* handler names and attaches listeners",
      async () => {
        const result = await page.evaluate(async () => {
          const { buildElement } = await import("/dom/src/dom.js");
          const calls: string[] = [];
          const el = buildElement("button", {
            on: {
              onClick: () => calls.push("click"),
            },
          }).element;
          document.body.append(el);
          el.click();
          el.click();
          el.remove();
          return calls;
        });
        assertEquals(result, ["click", "click"]);
      },
    );

    await t.step("accepts events as an alias for on", async () => {
      const result = await page.evaluate(async () => {
        const { buildElement } = await import("/dom/src/dom.js");
        let fired = 0;
        const el = buildElement("button", {
          events: { onMouseEnter: () => fired++ },
        }).element;
        el.dispatchEvent(new MouseEvent("mouseenter"));
        return fired;
      });
      assertEquals(result, 1);
    });

    await t.step("sets text content from text prop", async () => {
      const result = await page.evaluate(async () => {
        const { buildElement } = await import("/dom/src/dom.js");
        return buildElement("span", { text: "plain <b>text</b>" }).element
          .textContent;
      });
      assertEquals(result, "plain <b>text</b>");
    });

    await t.step(
      "returns the element with its props spread alongside",
      async () => {
        const result = await page.evaluate(async () => {
          const { buildElement } = await import("/dom/src/dom.js");
          const created = buildElement("section", { id: "x", text: "hi" });
          return {
            tag: created.element.tagName,
            same: created.el === created.element,
            id: created.id,
            text: created.element.textContent,
          };
        });
        assertEquals(result, {
          tag: "SECTION",
          same: true,
          id: "x",
          text: "hi",
        });
      },
    );

    await t.step(
      "createMountable accepts an object without props",
      async () => {
        const result = await page.evaluate(async () => {
          const { createMountable } = await import("/dom/src/dom.js");
          const fragment = createMountable({ el: "p", text: "hi" })();
          return fragment.firstElementChild?.outerHTML;
        });
        assertEquals(result, "<p>hi</p>");
      },
    );

    await t.step(
      "createMountable drops innerHTML from props and properties",
      async () => {
        const result = await page.evaluate(async () => {
          const { createMountable } = await import("/dom/src/dom.js");
          const fromProps = createMountable({
            el: "div",
            props: { innerHTML: "<b>x</b>", id: "a" },
          })();
          const fromProperties = createMountable({
            el: "div",
            properties: { innerHTML: "<b>x</b>", id: "b" },
          })();
          return [fromProps, fromProperties].map((f) =>
            f.firstElementChild?.outerHTML
          );
        });
        assertEquals(result, ['<div id="a"></div>', '<div id="b"></div>']);
      },
    );
  } finally {
    await browser.close();
    server?.kill();
  }
});
