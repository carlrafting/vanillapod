import { assertEquals } from "@std/assert";
import { chromium } from "playwright";
import { baseURL, startServer } from "./helpers.ts";

Deno.test("Theme toggle in Chromium", async (t) => {
  const server = await startServer();
  const browser = await chromium.launch({ channel: "chromium" });

  try {
    const page = await browser.newPage();
    const url = `${baseURL}/components/theme-toggle/`;
    const theme = () =>
      page.evaluate(() => document.documentElement.dataset.theme);

    await page.goto(url);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector("theme-toggle[loaded]");

    await t.step("keeps the default theme on a first visit", async () => {
      assertEquals(await theme(), "auto");
    });

    await t.step("applies and stores the selected theme", async () => {
      await page.check("#theme-dark");
      assertEquals(await theme(), "dark");
      assertEquals(
        await page.evaluate(() => localStorage.getItem("theme")),
        "dark",
      );
    });

    await t.step("restores the stored theme after a reload", async () => {
      await page.reload();
      await page.waitForSelector("theme-toggle[loaded]");
      assertEquals(await theme(), "dark");
      assertEquals(await page.isChecked("#theme-dark"), true);
      assertEquals(await page.isChecked("#theme-auto"), false);
    });
  } finally {
    await browser.close();
    await server?.kill();
  }
});
