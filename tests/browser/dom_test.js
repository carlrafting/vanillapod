import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const baseURL = "http://localhost:3000";
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

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

async function startServer() {
  if (await isServerReady()) return null;

  const server = new Deno.Command(Deno.execPath(), {
    args: ["task", "serve"],
    cwd: repoRoot,
    stdout: "null",
    stderr: "inherit",
  }).spawn();

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const status = await Promise.race([
      server.status,
      new Promise((resolve) => setTimeout(() => resolve(null), 250)),
    ]);
    if (status) {
      throw new Error(
        `Lume server exited before becoming ready: ${status.code}`,
      );
    }
    if (await isServerReady()) return server;
  }

  server.kill();
  throw new Error(
    `Lume server did not start at ${baseURL} within 120 seconds.`,
  );
}

async function isServerReady() {
  try {
    const response = await fetch(baseURL, {
      signal: AbortSignal.timeout(1_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
