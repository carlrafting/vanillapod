import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { chromium, firefox, webkit } from "playwright";
import type { Page } from "playwright";
import { baseURL, startServer } from "./helpers.ts";

// Run against another engine with e.g. `BROWSER=webkit deno task test`.
const engines = { chromium, firefox, webkit };
const engineName =
  (Deno.env.get("BROWSER") ?? "chromium") as keyof typeof engines;
if (!(engineName in engines)) {
  throw new Error(
    `Unknown BROWSER "${engineName}". Use chromium, firefox or webkit.`,
  );
}
const launch = () =>
  engineName === "chromium"
    ? chromium.launch({ channel: "chromium" })
    : engines[engineName].launch();

const root = "vp-playground";
const part = (name: string) => `${root} [data-part=${name}]`;
const editor = (page: Page) => page.locator(part("editor"));
const preview = (page: Page) => page.frameLocator(part("preview"));
const consoleLines = (page: Page) =>
  page.locator(`${part("console")} li`).allTextContents();

/** The editor's text. An emptied or freshly loaded editor can end in "\n". */
const code = async (page: Page) =>
  (await editor(page).evaluate((e) => e.textContent ?? "")).replace(/\n$/, "");

/** CodeJar re-highlights 30ms after a key; let that settle before reading. */
const settle = (page: Page) => page.waitForTimeout(100);

const pick = (page: Page, id: string) => page.selectOption(part("example"), id);

async function waitForConsole(page: Page, lines: number) {
  await page.waitForFunction(
    ({ selector, lines }) =>
      document.querySelectorAll(selector).length >= lines,
    { selector: `${part("console")} li`, lines },
  );
}

/** Empties the editor, ready for typing. */
async function clear(page: Page) {
  await editor(page).focus();
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Delete");
}

Deno.test(`Playground in ${engineName}`, async (t) => {
  const server = await startServer();
  const browser = await launch();

  /**
   * Opens /playground/ in a fresh context, runs the step, and fails it on any
   * uncaught page error (except ones the step expects).
   */
  async function open(
    run: (page: Page) => Promise<void>,
    { expectErrors = /(?!)/ }: { expectErrors?: RegExp } = {},
  ) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => {
      if (!expectErrors.test(e.message)) errors.push(e.message);
    });
    try {
      await page.goto(`${baseURL}/playground/`);
      await page.locator(`${root} .token`).first().waitFor();
      // Typing steps don't want the preview reloading under them.
      await page.locator(part("auto")).uncheck();
      await run(page);
      assertEquals(errors, [], "uncaught page errors");
    } finally {
      await context.close();
    }
  }

  try {
    await t.step(
      "is a light-DOM custom element with a highlighted editor",
      async () => {
        await open(async (page) => {
          assertEquals(
            await page.evaluate(
              (s) => document.querySelector(s)!.shadowRoot,
              root,
            ),
            null,
          );
          assert(await page.locator(`${root} .token`).count() > 10);
          assertEquals(
            await page.locator(part("preview")).getAttribute("sandbox"),
            "allow-scripts allow-forms",
          );
        });
      },
    );

    await t.step(
      "reads <pre> examples into the picker and starts on `example`",
      async () => {
        await open(async (page) => {
          const options = await page.locator(`${part("example")} option`)
            .evaluateAll((os) =>
              os.map((o) =>
                `${(o as HTMLOptionElement).value}|${o.textContent}`
              )
            );
          assertEquals(options, [
            "hello|Hello, world",
            "counter|Counter (createStore + bind)",
            "list|List (bindList)",
            "console|Console output",
          ]);
          assertEquals(
            await page.locator(part("example")).inputValue(),
            "counter",
          );
          assertEquals(
            await page.locator(`${root} pre:not([data-part])`).count(),
            0,
          );
        });
      },
    );

    await t.step(
      "dedents <pre> code, falls back to a built-in example",
      async () => {
        await open(async (page) => {
          await page.evaluate(() => {
            // Built with the DOM API: the <pre> children must exist before the
            // element connects, which is when it reads them.
            const pre = (id: string, text: string, title?: string) => {
              const el = document.createElement("pre");
              el.id = id;
              if (title) el.dataset.title = title;
              el.textContent = text;
              return el;
            };
            const authored = document.createElement("vp-playground");
            authored.id = "authored";
            authored.setAttribute("example", "nope");
            authored.append(
              pre(
                "a",
                [
                  '                import { render, p } from "vanillapod";',
                  '                render([p("a < b & c")], document.querySelector("#app"));',
                  "              ",
                ].join("\n"),
                "A",
              ),
              pre("b", 'console.log("b")'),
            );
            const bare = document.createElement("vp-playground");
            bare.id = "bare";
            document.querySelector("main")!.append(authored, bare);
          });
          const authored = page.locator("#authored");
          assertEquals(
            await authored.locator("[data-part=example] option").evaluateAll((
              os,
            ) =>
              os.map((o) =>
                `${(o as HTMLOptionElement).value}|${o.textContent}`
              )
            ),
            ["a|A", "b|b"], // data-title, else the id
          );
          // An unknown `example` falls back to the first.
          assertEquals(
            await authored.locator("[data-part=example]").inputValue(),
            "a",
          );
          assertEquals(
            await authored.locator("[data-part=editor]").evaluate((e) =>
              e.textContent
            ),
            'import { render, p } from "vanillapod";\n' +
              'render([p("a < b & c")], document.querySelector("#app"));\n',
          );

          const bare = page.locator("#bare");
          assertEquals(
            await bare.locator("[data-part=example] option").count(),
            1,
          );
          assertEquals(
            await bare.locator("[data-part=example]").isHidden(),
            true,
          );
          assertStringIncludes(
            (await bare.locator("[data-part=editor]").textContent()) ?? "",
            "createStore",
          );
        });
      },
    );

    await t.step(
      "Enter at the end of the text keeps every newline",
      async () => {
        await open(async (page) => {
          await pick(page, "hello");
          await clear(page);
          for (
            const key of [
              "ab",
              "Enter",
              "c",
              "Enter",
              "Enter",
              "d",
              "Enter",
              "e",
            ]
          ) {
            if (key === "Enter") await page.keyboard.press(key);
            else await page.keyboard.type(key);
          }
          await settle(page);
          assertEquals(await code(page), "ab\nc\n\nd\ne");
          assertEquals(await editor(page).locator("br").count(), 0);
        });
      },
    );

    await t.step(
      "Enter at the end of an example that ends in a newline",
      async () => {
        await open(async (page) => {
          await pick(page, "hello");
          await editor(page).focus();
          await page.keyboard.press("Control+End");
          for (
            const key of [
              "x",
              "Enter",
              "y",
              "Enter",
              "z",
              "Enter",
              "Enter",
              "w",
            ]
          ) {
            if (key === "Enter") await page.keyboard.press(key);
            else await page.keyboard.type(key);
          }
          await settle(page);
          assertStringIncludes(await code(page), "x\ny\nz\n\nw");
          assertEquals(await editor(page).locator("br").count(), 0);
        });
      },
    );

    await t.step("Enter mid-line, then Tab and indent carry-over", async () => {
      await open(async (page) => {
        await clear(page);
        await page.keyboard.type("ab");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("Enter");
        await page.keyboard.press("Tab");
        await page.keyboard.type("q");
        await page.keyboard.press("Enter");
        await page.keyboard.type("r");
        await settle(page);
        assertEquals(await code(page), "a\n  q\n  rb");
      });
    });

    await t.step("Enter indents after an opening brace", async () => {
      await open(async (page) => {
        await clear(page);
        await page.keyboard.type("if (x) {");
        await page.keyboard.press("Enter");
        await page.keyboard.type("y");
        await settle(page);
        assertEquals(await code(page), "if (x) {\n  y");
      });
    });

    await t.step("Enter replaces a selection", async () => {
      await open(async (page) => {
        await clear(page);
        await page.keyboard.type("abcd");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("Shift+ArrowLeft");
        await page.keyboard.press("Shift+ArrowLeft");
        await page.keyboard.press("Enter");
        await page.keyboard.type("X");
        await settle(page);
        assertEquals(await code(page), "a\nXd");
      });
    });

    await t.step("Backspace removes an inserted newline", async () => {
      await open(async (page) => {
        await clear(page);
        await page.keyboard.type("ab");
        await page.keyboard.press("Enter");
        await page.keyboard.type("c");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("Backspace");
        await settle(page);
        assertEquals(await code(page), "abc");
      });
    });

    await t.step(
      "Tab indents, and Esc then Tab leaves the editor",
      async () => {
        await open(async (page) => {
          await clear(page);
          await page.keyboard.press("Tab");
          await page.keyboard.type("x");
          await settle(page);
          assertEquals(await code(page), "  x");

          const before = await code(page);
          await page.keyboard.press("Escape");
          await page.keyboard.press("Tab");
          assertEquals(
            await page.evaluate(() =>
              document.activeElement?.matches("[data-part=editor]")
            ),
            false,
          );
          assertEquals(await code(page), before);
        });
      },
    );

    await t.step("Ctrl+Z undoes typing", async () => {
      await open(async (page) => {
        await clear(page);
        await page.keyboard.type("ab");
        await page.waitForTimeout(500); // CodeJar batches history for 300ms
        await page.keyboard.press("Enter");
        await page.keyboard.type("c");
        await page.waitForTimeout(500);
        assertEquals(await code(page), "ab\nc");
        await page.keyboard.press("Control+z");
        await settle(page);
        const undone = await code(page);
        assert(!undone.includes("c") && undone.includes("ab"), undone);
      });
    });

    await t.step(
      "keeps the caret in view after Enter in a long document",
      async () => {
        await open(async (page) => {
          await pick(page, "list");
          await editor(page).focus();
          await page.keyboard.press("Control+End");
          for (let i = 0; i < 40; i++) await page.keyboard.press("Enter");
          await page.keyboard.type("LAST");
          await settle(page);
          const { top, client, height } = await editor(page).evaluate((e) => ({
            top: e.scrollTop,
            client: e.clientHeight,
            height: e.scrollHeight,
          }));
          assert(
            top + client >= height - 60,
            `not scrolled: ${top}+${client}/${height}`,
          );
          assertStringIncludes(await code(page), "LAST");
        });
      },
    );

    await t.step("typing after switching examples doesn't throw", async () => {
      // WebKit keeps a selection into the old content, at an offset the new
      // content may not have; CodeJar's next keydown used to throw
      // IndexSizeError. `open` fails the step on any uncaught page error.
      await open(async (page) => {
        await pick(page, "list");
        await editor(page).focus();
        await page.keyboard.press("Control+End");
        for (let i = 0; i < 40; i++) await page.keyboard.press("Enter");
        await pick(page, "hello");
        await editor(page).focus();
        await page.keyboard.type("x");
        await settle(page);
        assertStringIncludes(await code(page), "x");
      });
    });

    await t.step(
      "Ctrl+Enter runs the code and captures the console",
      async () => {
        await open(async (page) => {
          await clear(page);
          await page.keyboard.type('console.log("hi", 1 + 1)');
          await page.keyboard.press("Control+Enter");
          await waitForConsole(page, 1);
          assertEquals(await consoleLines(page), ["hi 2"]);
        });
      },
    );

    await t.step(
      "reports uncaught errors in the console and status",
      async () => {
        await open(async (page) => {
          await clear(page);
          await page.keyboard.type('throw new Error("boom")');
          await page.keyboard.press("Control+Enter");
          await waitForConsole(page, 1);
          assertStringIncludes((await consoleLines(page)).join("\n"), "boom");
          assertStringIncludes(
            (await page.locator(part("status")).textContent()) ?? "",
            "Error",
          );
        }, { expectErrors: /boom/ });
      },
    );

    await t.step("every example runs", async () => {
      for (const id of ["hello", "counter", "list", "console"]) {
        await open(async (page) => {
          await pick(page, id);
          await preview(page).locator("#app > *").first().waitFor();
          assertEquals(
            await page.locator(`${part("console")} li[data-level=error]`)
              .count(),
            0,
            `example ${id} logged an error`,
          );
        });
      }
    });

    await t.step("the counter example increments", async () => {
      await open(async (page) => {
        await pick(page, "counter");
        const button = preview(page).getByRole("button", { name: "Increment" });
        await button.click();
        await button.click();
        assertEquals(
          await preview(page).locator("#app p").innerText(),
          "Count: 2",
        );
      });
    });

    await t.step(
      "the list example adds (Enter and button), counts and removes",
      async () => {
        // Needs allow-forms on the sandbox and a re-assigned array for bind().
        await open(async (page) => {
          await pick(page, "list");
          const frame = preview(page);
          const field = frame.getByPlaceholder("New item");
          const count = frame.locator("#app p");
          await field.fill("Second");
          await field.press("Enter");
          await field.fill("Third");
          await frame.getByRole("button", { name: "Add" }).click();
          assertEquals(await count.innerText(), "3 item(s)");
          await frame.locator("li", { hasText: "Second" })
            .getByRole("button", { name: "Remove" }).click();
          assertEquals(await count.innerText(), "2 item(s)");
          assertEquals(await frame.locator("li").count(), 2);
        });
      },
    );

    await t.step(
      "regions are labelled by their headings, with unique ids",
      async () => {
        await open(async (page) => {
          const labels = await page.evaluate(() =>
            [...document.querySelectorAll(
              "vp-playground [aria-labelledby]",
            )]
              .map((el) =>
                document.getElementById(el.getAttribute("aria-labelledby")!)
                  ?.textContent
              )
          );
          assertEquals(labels, ["Code", "Preview", "Console"]);
          const ids = await page.evaluate(() =>
            [...document.querySelectorAll("vp-playground h2")].map((h) => h.id)
          );
          assertEquals(new Set(ids).size, ids.length);
          assertEquals(ids.every(Boolean), true);
        });
      },
    );

    await t.step("the preview can't reach the page", async () => {
      await open(async (page) => {
        await clear(page);
        await page.keyboard.type(
          'try { parent.document.title; console.log("reachable"); } catch (e) { console.log("blocked", e.name); }',
        );
        await page.keyboard.press("Control+Enter");
        await waitForConsole(page, 1);
        const [line] = await consoleLines(page);
        assert(line.startsWith("blocked"), line);
      });
    });

    await t.step(
      "share link sets the hash and restores code after a reload",
      async () => {
        await open(async (page) => {
          await clear(page);
          await page.keyboard.type('console.log("héllo ✓")');
          await page.locator(part("share")).click();
          await page.waitForFunction(() => location.hash.startsWith("#code="));
          await page.reload();
          await page.locator(`${root} .token`).first().waitFor();
          await waitForConsole(page, 1);
          assertEquals(await code(page), 'console.log("héllo ✓")');
          assertEquals(await consoleLines(page), ["héllo ✓"]);
        });
      },
    );

    await t.step(
      "share link survives code whose base64 contains + and /",
      async () => {
        // "?>>" encodes to Pz4+ and "???" to Pz8/ in standard base64.
        const text = 'console.log("?>>???")';
        await open(async (page) => {
          await clear(page);
          await page.keyboard.type(text);
          await page.locator(part("share")).click();
          await page.waitForFunction(() => location.hash.startsWith("#code="));
          assert(!/[+/ ]/.test(await page.evaluate(() => location.hash)));
          await page.reload();
          await page.locator(`${root} .token`).first().waitFor();
          await waitForConsole(page, 1);
          assertEquals(await code(page), text);
        });
      },
    );
  } finally {
    await browser.close();
    server?.kill();
  }
});
