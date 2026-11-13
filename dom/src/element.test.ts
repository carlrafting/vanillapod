import { assert, assertEquals, assertThrows } from "@std/assert";
import debug, { createDebug } from "./debug.js";
import { createElement, h, validateProps } from "./element.js";

Deno.test("validateProps accepts known keys", () => {
  assert(validateProps({ text: "hi", classList: ["a"] }));
});

Deno.test("validateProps throws on unknown keys when debug is enabled", () => {
  debug(true);
  try {
    assertThrows(() => validateProps({ bogus: 1 }), Error, "bogus");
  } finally {
    createDebug("t")("t").disable();
  }
});

Deno.test("h is an alias of createElement", () => {
  assertEquals(h, createElement);
});
