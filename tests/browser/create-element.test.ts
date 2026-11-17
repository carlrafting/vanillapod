import { assertEquals } from "@std/assert";
import { chromium } from "playwright";
import { baseURL, startServer } from "./helpers.ts";

Deno.test("createElement props in Chromium", async (t) => {
  const server = await startServer();
  const browser = await chromium.launch({ channel: "chromium" });

  try {
    const page = await browser.newPage();
    await page.goto(`${baseURL}/examples/tasks/`);

    await t.step("applies classList and classNames", async () => {
      const result = await page.evaluate(async () => {
        const { createElement } = await import("/dom/src/element.js");
        const fromList = createElement("div", { classList: ["a", "b"] }).element;
        const fromNames = createElement("div", { classNames: ["c"] }).element;
        return {
          list: fromList.className,
          names: fromNames.className,
        };
      });
      assertEquals(result, { list: "a b", names: "c" });
    });

    await t.step("applies data props as dataset entries", async () => {
      const result = await page.evaluate(async () => {
        const { createElement } = await import("/dom/src/element.js");
        const el = createElement("div", { data: { taskId: "42", kind: "todo" } })
          .element;
        return { taskId: el.dataset.taskId, kind: el.dataset.kind };
      });
      assertEquals(result, { taskId: "42", kind: "todo" });
    });

    await t.step("sets attributes from attrs and attributes", async () => {
      const result = await page.evaluate(async () => {
        const { createElement } = await import("/dom/src/element.js");
        const fromAttrs = createElement("input", {
          attrs: { type: "checkbox", "aria-label": "Done" },
        }).element;
        const fromAttributes = createElement("input", {
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
        const { createElement } = await import("/dom/src/element.js");
        const el = createElement("input", { props: { value: "hello", hidden: true } })
          .element;
        return { value: el.value, hidden: el.hidden };
      });
      assertEquals(result, { value: "hello", hidden: true });
    });

    await t.step("normalizes on* handler names and attaches listeners", async () => {
      const result = await page.evaluate(async () => {
        const { createElement } = await import("/dom/src/element.js");
        const calls: string[] = [];
        const el = createElement("button", {
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
    });

    await t.step("accepts events as an alias for on", async () => {
      const result = await page.evaluate(async () => {
        const { createElement } = await import("/dom/src/element.js");
        let fired = 0;
        const el = createElement("button", {
          events: { onMouseEnter: () => fired++ },
        }).element;
        el.dispatchEvent(new MouseEvent("mouseenter"));
        return fired;
      });
      assertEquals(result, 1);
    });

    await t.step("sets text content from text prop", async () => {
      const result = await page.evaluate(async () => {
        const { createElement } = await import("/dom/src/element.js");
        return createElement("span", { text: "plain <b>text</b>" }).element
          .textContent;
      });
      assertEquals(result, "plain <b>text</b>");
    });

    await t.step("returns the element with its props spread alongside", async () => {
      const result = await page.evaluate(async () => {
        const { createElement } = await import("/dom/src/element.js");
        const created = createElement("section", { id: "x", text: "hi" });
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
    });
  } finally {
    await browser.close();
    server?.kill();
  }
});
