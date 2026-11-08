import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/tasks/");
});

test("creates and renders elements with browser DOM properties", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { div, render } = await import("/dom/main.js");
    const root = document.createElement("main");
    const content = div(
      { id: "greeting", className: "message" },
      "Hello, DOM!",
    );

    render([content], root);

    return {
      tagName: root.firstElementChild.tagName,
      id: root.firstElementChild.id,
      className: root.firstElementChild.className,
      textContent: root.textContent,
    };
  });

  expect(result).toEqual({
    tagName: "DIV",
    id: "greeting",
    className: "message",
    textContent: "Hello, DOM!",
  });
});

test("registers native event handlers when rendered", async ({ page }) => {
  const wasClicked = await page.evaluate(async () => {
    const { button, render } = await import("/dom/main.js");
    const root = document.createElement("main");
    const content = button({
      onclick: () => {
        root.dataset.clicked = "true";
      },
    }, "Activate");

    render([content], root);
    root.querySelector("button").click();

    return root.dataset.clicked === "true";
  });

  expect(wasClicked).toBe(true);
});
