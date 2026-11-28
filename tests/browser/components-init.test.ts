import { assertEquals } from "@std/assert";
import { chromium } from "playwright";
import { baseURL, startServer } from "./helpers.ts";

// Every init function can be called again on the same page, for example after
// inserting markup, without adding a second set of listeners to elements it
// already enhanced. Each test calls an init function twice and then triggers
// the behavior once: a doubled listener shows up as the behavior running twice.
Deno.test("Component init functions are idempotent in Chromium", async (t) => {
  const server = await startServer();
  const browser = await chromium.launch({ channel: "chromium" });

  try {
    const page = await browser.newPage();
    // A page with the document layout, which adds the import map for
    // @vanillapod/dom that tabs, tooltip and validation-summary need.
    await page.goto(`${baseURL}/docs/`);
    page.on("pageerror", (error) => console.error(error));

    await t.step("initCopyButtons copies once per click", async () => {
      const writes = await page.evaluate(async () => {
        const { initCopyButtons } = await import(
          "/components/copy-button/copy-button.js"
        );
        document.body.insertAdjacentHTML(
          "beforeend",
          `<div id="copy-root"><p id="copy-source">text</p>
           <button data-copy-target="copy-source">Copy</button><span></span></div>`,
        );
        const root = document.getElementById("copy-root")!;
        let writes = 0;
        Object.defineProperty(navigator, "clipboard", {
          value: { writeText: () => (writes++, Promise.resolve()) },
          configurable: true,
        });
        initCopyButtons(root);
        initCopyButtons(root);
        root.querySelector("button")!.click();
        root.remove();
        return writes;
      });
      assertEquals(writes, 1);
    });

    await t.step(
      "initDialogs opens once, and enhances new buttons",
      async () => {
        const result = await page.evaluate(async () => {
          const { initDialogs } = await import("/components/dialog/dialog.js");
          document.body.insertAdjacentHTML(
            "beforeend",
            `<div id="dialog-root"><dialog id="d1"></dialog>
           <button id="b1" data-dialog-open="d1">Open</button></div>`,
          );
          const root = document.getElementById("dialog-root")!;
          const dialog = root.querySelector("dialog")!;
          let opened = 0;
          dialog.showModal = () => void opened++;
          initDialogs(root);
          root.insertAdjacentHTML(
            "beforeend",
            `<button id="b2" data-dialog-open="d1">Open again</button>`,
          );
          initDialogs(root);
          root.querySelector<HTMLButtonElement>("#b1")!.click();
          const afterFirst = opened;
          root.querySelector<HTMLButtonElement>("#b2")!.click();
          root.remove();
          return { afterFirst, total: opened };
        });
        // b1 was enhanced once, and b2 was picked up by the second call.
        assertEquals(result, { afterFirst: 1, total: 2 });
      },
    );

    await t.step("initPasswordInputs toggles once per click", async () => {
      const type = await page.evaluate(async () => {
        const { initPasswordInputs } = await import(
          "/components/password-input/password-input.js"
        );
        document.body.insertAdjacentHTML(
          "beforeend",
          `<div id="pw-root"><div class="password-input">
           <input type="password"><button type="button">Show password</button>
           </div></div>`,
        );
        const root = document.getElementById("pw-root")!;
        initPasswordInputs(root);
        initPasswordInputs(root);
        root.querySelector("button")!.click();
        const type = root.querySelector("input")!.type;
        root.remove();
        return type;
      });
      assertEquals(type, "text");
    });

    await t.step("initTables sorts once per click", async () => {
      const sort = await page.evaluate(async () => {
        const { initTables } = await import("/components/table/table.js");
        document.body.insertAdjacentHTML(
          "beforeend",
          `<div id="table-root"><table class="table"><thead><tr>
           <th aria-sort="none"><button type="button">Name</button></th></tr>
           </thead><tbody><tr><td>b</td></tr><tr><td>a</td></tr></tbody></table></div>`,
        );
        const root = document.getElementById("table-root")!;
        initTables(root);
        initTables(root);
        root.querySelector("button")!.click();
        const sort = root.querySelector("th")!.getAttribute("aria-sort");
        root.remove();
        return sort;
      });
      assertEquals(sort, "ascending");
    });

    await t.step("initTabs selects once per click", async () => {
      const focused = await page.evaluate(async () => {
        const { initTabs } = await import("/components/tabs/tabs.js");
        document.body.insertAdjacentHTML(
          "beforeend",
          `<div id="tabs-root"><div class="tabs"><div role="tablist">
           <button role="tab" aria-controls="p1" aria-selected="true">One</button>
           </div></div><div id="p1"></div></div>`,
        );
        const root = document.getElementById("tabs-root")!;
        const tab = root.querySelector<HTMLElement>("[role=tab]")!;
        let focused = 0;
        tab.focus = () => void focused++;
        initTabs(root);
        initTabs(root);
        tab.click();
        root.remove();
        return focused;
      });
      assertEquals(focused, 1);
    });

    await t.step("initTooltips shows once per hover", async () => {
      const shown = await page.evaluate(async () => {
        const { initTooltips } = await import("/components/tooltip/tooltip.js");
        document.body.insertAdjacentHTML(
          "beforeend",
          `<div id="tip-root"><button data-tooltip="tip1">Hover</button>
           <div id="tip1" popover>Tip</div></div>`,
        );
        const root = document.getElementById("tip-root")!;
        const tip = root.querySelector<HTMLElement>("#tip1")!;
        let shown = 0;
        tip.showPopover = () => void shown++;
        initTooltips(root);
        initTooltips(root);
        root.querySelector("button")!.dispatchEvent(new Event("mouseenter"));
        root.remove();
        return shown;
      });
      assertEquals(shown, 1);
    });

    await t.step(
      "initValidationSummaries validates once per submit",
      async () => {
        const checks = await page.evaluate(async () => {
          const { initValidationSummaries } = await import(
            "/components/validation-summary/validation-summary.js"
          );
          document.body.insertAdjacentHTML(
            "beforeend",
            `<div id="vs-root"><form class="validated-form" novalidate>
           <div class="validation-summary" tabindex="-1" hidden><ul></ul></div>
           <input id="vs-name" name="name" required></form></div>`,
          );
          const root = document.getElementById("vs-root")!;
          const input = root.querySelector("input")!;
          let checks = 0;
          const check = input.checkValidity.bind(input);
          input.checkValidity = () => (checks++, check());
          initValidationSummaries(root);
          initValidationSummaries(root);
          root.querySelector("form")!.dispatchEvent(
            new Event("submit", { cancelable: true }),
          );
          root.remove();
          return checks;
        });
        assertEquals(checks, 1);
      },
    );
  } finally {
    await browser.close();
    await server?.kill();
  }
});
