import { assert, assertEquals } from "@std/assert";
import debug, { createDebug } from "./debug.js";

Deno.test("debug() is disabled by default and can be toggled", () => {
  assertEquals(debug(), false);
  debug(true);
  assertEquals(debug(), true);
  // passing false only reads the current state
  assertEquals(debug(false), true);
  createDebug("test")("reset").disable();
  assertEquals(debug(), false);
});

Deno.test("createDebug returns a logger factory with enable/disable/log", () => {
  const log = createDebug("vanillapod");
  const logger = log("mymethod");

  logger.enable();
  assertEquals(debug(), true);
  logger.disable();
  assertEquals(debug(), false);

  const original = console.log;
  const calls: unknown[][] = [];
  console.log = (...args: unknown[]) => void calls.push(args);
  try {
    logger.log("example");
  } finally {
    console.log = original;
  }
  assertEquals(calls.length, 1);
  assert(calls[0].includes("vanillapod"));
  assert(calls[0].includes("mymethod"));
  assert(calls[0].includes("example"));
});
