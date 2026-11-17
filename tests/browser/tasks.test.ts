import { assertEquals, assertStringIncludes } from "@std/assert";
import { chromium } from "playwright";
import { baseURL, startServer } from "./helpers.ts";

const storageKey = "vanillapod-example-tasks";

Deno.test("Tasks example app in Chromium", async (t) => {
  const server = await startServer();
  const browser = await chromium.launch({ channel: "chromium" });

  async function openApp(seed?: string) {
    const context = await browser.newContext();
    if (seed !== undefined) {
      await context.addInitScript(
        ({ key, value }) => localStorage.setItem(key, value),
        { key: storageKey, value: seed },
      );
    }
    const page = await context.newPage();
    await page.goto(`${baseURL}/examples/tasks/`);
    return { context, page };
  }

  async function addTask(page: any, title: string) {
    await page.fill("#task-input", title);
    await page.click(".add-button");
  }

  const titles = (page: any) =>
    page.locator(".task-item:visible .task-title").allTextContents();
  const countText = (page: any) => page.locator(".task-count").textContent();
  const stored = (page: any) =>
    page.evaluate(
      (key: string) => JSON.parse(localStorage.getItem(key) ?? "null"),
      storageKey,
    );

  try {
    await t.step("shows the empty state when there are no tasks", async () => {
      const { context, page } = await openApp();
      try {
        assertStringIncludes(
          await page.locator(".empty-state").textContent() ?? "",
          "Nothing on your list yet",
        );
        assertEquals(await countText(page), "0 tasks left");
        assertEquals(await page.locator(".clear-button").isDisabled(), true);
      } finally {
        await context.close();
      }
    });

    await t.step("adds a trimmed task at the top and persists it", async () => {
      const { context, page } = await openApp();
      try {
        await addTask(page, "  First thing  ");
        await addTask(page, "Second thing");

        assertEquals(await titles(page), ["Second thing", "First thing"]);
        assertEquals(await countText(page), "2 tasks left");
        assertEquals(await page.inputValue("#task-input"), "");
        const saved = await stored(page);
        assertEquals(saved.map((task: any) => task.title), [
          "Second thing",
          "First thing",
        ]);
        assertEquals(saved.every((task: any) => task.completed === false), true);
      } finally {
        await context.close();
      }
    });

    await t.step("ignores whitespace-only submissions", async () => {
      const { context, page } = await openApp();
      try {
        await addTask(page, "    ");
        assertEquals(await titles(page), []);
        assertEquals(await stored(page), null);
      } finally {
        await context.close();
      }
    });

    await t.step("toggling completion updates count, styling and storage", async () => {
      const { context, page } = await openApp();
      try {
        await addTask(page, "Water plants");
        await page.locator(".task-toggle").check();

        assertEquals(await countText(page), "0 tasks left");
        assertEquals(
          await page.locator(".task-item").first().getAttribute("class"),
          "task-item is-complete",
        );
        assertEquals((await stored(page))[0].completed, true);

        await page.locator(".task-toggle").uncheck();
        assertEquals(await countText(page), "1 task left");
        assertEquals((await stored(page))[0].completed, false);
      } finally {
        await context.close();
      }
    });

    await t.step("filters show active and completed tasks", async () => {
      const { context, page } = await openApp();
      try {
        await addTask(page, "Done one");
        await addTask(page, "Open one");
        await page.locator(".task-item", { hasText: "Done one" })
          .locator(".task-toggle").check();

        await page.click("[data-filter=active]");
        assertEquals(await titles(page), ["Open one"]);
        assertEquals(
          await page.getAttribute("[data-filter=active]", "aria-pressed"),
          "true",
        );

        await page.click("[data-filter=completed]");
        assertEquals(await titles(page), ["Done one"]);

        await page.click("[data-filter=all]");
        assertEquals(await titles(page), ["Open one", "Done one"]);
      } finally {
        await context.close();
      }
    });

    await t.step("empty filtered views show a contextual message", async () => {
      const { context, page } = await openApp();
      try {
        await addTask(page, "Only open");
        await page.click("[data-filter=completed]");
        assertStringIncludes(
          await page.locator(".empty-state").textContent() ?? "",
          "Completed tasks will show up here.",
        );
        await page.click("[data-filter=all]");
        await page.locator(".task-toggle").check();
        await page.click("[data-filter=active]");
        assertStringIncludes(
          await page.locator(".empty-state").textContent() ?? "",
          "all caught up",
        );
      } finally {
        await context.close();
      }
    });

    await t.step("deletes only the chosen task", async () => {
      const { context, page } = await openApp();
      try {
        await addTask(page, "Keep me");
        await addTask(page, "Remove me");
        await page.locator(".task-item", { hasText: "Remove me" })
          .locator(".delete-button").click();

        assertEquals(await titles(page), ["Keep me"]);
        assertEquals((await stored(page)).map((task: any) => task.title), [
          "Keep me",
        ]);
      } finally {
        await context.close();
      }
    });

    await t.step("clear completed removes only completed tasks", async () => {
      const { context, page } = await openApp();
      try {
        await addTask(page, "Finished");
        await addTask(page, "Pending");
        await page.locator(".task-item", { hasText: "Finished" })
          .locator(".task-toggle").check();

        assertEquals(await page.locator(".clear-button").isDisabled(), false);
        await page.click(".clear-button");

        assertEquals(await titles(page), ["Pending"]);
        assertEquals((await stored(page)).map((task: any) => task.title), [
          "Pending",
        ]);
        assertEquals(await page.locator(".clear-button").isDisabled(), true);
      } finally {
        await context.close();
      }
    });

    await t.step("restores saved tasks after reload", async () => {
      const { context, page } = await openApp();
      try {
        await addTask(page, "Survives reload");
        await page.reload();
        assertEquals(await titles(page), ["Survives reload"]);
      } finally {
        await context.close();
      }
    });

    await t.step("loads valid saved tasks and skips malformed entries", async () => {
      const seed = JSON.stringify([
        { id: "a", title: "Valid", completed: true },
        { id: 2, title: "Bad id", completed: false },
        { id: "c", title: "Missing flag" },
        null,
        { id: "d", title: "Also valid", completed: false },
      ]);
      const { context, page } = await openApp(seed);
      try {
        assertEquals(await titles(page), ["Valid", "Also valid"]);
        assertEquals(await countText(page), "1 task left");
      } finally {
        await context.close();
      }
    });

    await t.step("starts empty when saved data is corrupt or not an array", async () => {
      for (const seed of ["{not json", JSON.stringify({ title: "object" })]) {
        const { context, page } = await openApp(seed);
        try {
          assertEquals(await titles(page), []);
          assertEquals(await countText(page), "0 tasks left");
        } finally {
          await context.close();
        }
      }
    });

    await t.step("reports when changes cannot be saved", async () => {
      const context = await browser.newContext();
      await context.addInitScript(() => {
        Storage.prototype.setItem = () => {
          throw new DOMException("Quota exceeded", "QuotaExceededError");
        };
      });
      const page = await context.newPage();
      try {
        await page.goto(`${baseURL}/examples/tasks/`);
        await addTask(page, "Unsaved");
        assertEquals(
          await page.locator(".feedback").textContent(),
          "Your changes could not be saved on this device.",
        );
        assertEquals(await titles(page), ["Unsaved"]);
      } finally {
        await context.close();
      }
    });
  } finally {
    await browser.close();
    server?.kill();
  }
});
