import { chromium } from "playwright";
import { baseURL, startServer } from "./helpers.ts";

Deno.test("DOM API runs in Chromium", async (t) => {
  const server = await startServer();

  try {
    const browser = await chromium.launch({ channel: "chromium" });
    try {
      const page = await browser.newPage();
      await page.goto(`${baseURL}/examples/tasks/`);

      await t.step(
        "creates and renders elements with DOM properties",
        async () => {
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

          if (
            result.tagName !== "DIV" ||
            result.id !== "greeting" ||
            result.className !== "message" ||
            result.textContent !== "Hello, DOM!"
          ) {
            throw new Error(
              `Unexpected rendered element: ${JSON.stringify(result)}`,
            );
          }
        },
      );

      await t.step(
        "registers native event handlers when rendered",
        async () => {
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

          if (!wasClicked) {
            throw new Error("The button click handler was not called.");
          }
        },
      );
    } finally {
      await browser.close();
    }
  } finally {
    await server?.kill();
  }
});
