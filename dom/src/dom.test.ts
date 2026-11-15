import { assert, assertEquals, assertFalse } from "@std/assert";
import { createElement, h, validateProps } from "./dom.js";

Deno.test("validateProps accepts known keys", () => {
  assert(validateProps({ text: "hi", classList: ["a"] }));
});

Deno.test("validateProps returns false for unknown keys", () => {
  assertFalse(validateProps({ bogus: 1 }));
});

Deno.test("h is an alias of createElement", () => {
  assertEquals(h, createElement);
});
