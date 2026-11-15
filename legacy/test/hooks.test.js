import { test } from "node:test";
import assert from "node:assert/strict";
import { triggerHook } from "../src/hooks.js";

test("triggerHook does nothing when the hook does not exist on the element", () => {
  const el = {};
  assert.doesNotThrow(() => triggerHook(el, "update", { value: 123 }));
});
