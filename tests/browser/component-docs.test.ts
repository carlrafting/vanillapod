import { assertEquals } from "@std/assert";
import { componentSources, customProperties } from "../../_lib/components.ts";

Deno.test("customProperties reads declarations and var() fallbacks in order", () => {
  const css = `
    /* --commented-out: 1px; */
    @scope (.thing) {
      :scope {
        --thing-color: royalblue;
        --thing-size: min(90vw, 32rem);
        gap: var(--thing-gap, 1rem);
        background: color-mix(in srgb, var(--thing-color) 12%, transparent);
      }
      :scope[data-variant="danger"] { --thing-color: crimson; }
      padding: var(--thing-padding, calc(1rem + 2px));
    }
  `;
  assertEquals(customProperties(css), [
    { name: "--thing-color", value: "royalblue" },
    { name: "--thing-size", value: "min(90vw, 32rem)" },
    { name: "--thing-gap", value: "1rem" },
    { name: "--thing-padding", value: "calc(1rem + 2px)" },
  ]);
});

Deno.test("customProperties keeps a declared value over a later fallback", () => {
  const css = `a { --x: 2px; } b { margin: var(--x, 9px); }`;
  assertEquals(customProperties(css), [{ name: "--x", value: "2px" }]);
});

Deno.test("componentSources lists markup, styles and scripts without front matter", () => {
  const dir = new URL("../../components/tabs", import.meta.url).pathname;
  const sources = componentSources(dir);
  assertEquals(
    sources.map(({ name, language }) => `${name}:${language}`),
    ["index.html:html", "styles.css:css", "tabs.js:javascript"],
  );
  assertEquals(sources[0].code.startsWith("---"), false);
  assertEquals(sources[0].code.includes('class="tabs"'), true);
});

Deno.test("componentSources leaves out internal files starting with _", () => {
  const dir = new URL("../../components/code-highlight", import.meta.url)
    .pathname;
  const names = componentSources(dir).map(({ name }) => name);
  assertEquals(names.includes("_example.md"), false);
});
