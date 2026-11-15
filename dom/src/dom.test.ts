import { assertEquals } from "@std/assert";
import { createElement, h } from "./dom.js";

Deno.test("h is an alias of createElement", () => {
  assertEquals(h, createElement);
});
