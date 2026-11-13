import { assert, assertEquals, assertFalse } from "@std/assert";
import { checkType, createArray, debounce, delay, isEqual } from "./utils.js";

Deno.test("checkType returns lowercase type names", () => {
  assertEquals(checkType([]), "array");
  assertEquals(checkType({}), "object");
  assertEquals(checkType(null), "null");
  assertEquals(checkType("a"), "string");
  assertEquals(checkType(1), "number");
  assertEquals(checkType(() => {}), "function");
});

Deno.test("isEqual compares nested objects and arrays", () => {
  assert(isEqual({ a: 1, b: { c: [1, 2] } }, { a: 1, b: { c: [1, 2] } }));
  assert(isEqual([{ v: 1 }, { v: 2 }], [{ v: 1 }, { v: 2 }]));
  assertFalse(isEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } }));
  assertFalse(isEqual([1, 2, 3], [1, 2]));
  assertFalse(isEqual([1], { 0: 1 }));
  assertFalse(isEqual(1 as never, 1 as never));
});

Deno.test("createArray supports basic operations", () => {
  const arr = createArray(1, 2, 3);
  assertEquals(arr.first(), 1);
  assertEquals(arr.get(1), 2);
  arr.add(4);
  assertEquals(arr.entries(), [1, 2, 3, 4]);
  assertEquals(arr.remove(0), [1]);
  assertEquals(arr.clone(), [2, 3, 4]);
  assertEquals(arr.clear(), true);
  assertEquals(arr.clear(), false);
});

Deno.test("delay runs fn with args after timeout", async () => {
  const calls: number[][] = [];
  delay((a: number, b: number) => calls.push([a, b]), 5, 1, 2);
  assertEquals(calls.length, 0);
  await new Promise((r) => setTimeout(r, 30));
  assertEquals(calls, [[1, 2]]);
});

Deno.test("debounce collapses rapid calls into one", async () => {
  let count = 0;
  let last = 0;
  const fn = debounce((n: number) => {
    count++;
    last = n;
  }, 20);
  fn(1);
  fn(2);
  fn(3);
  await new Promise((r) => setTimeout(r, 60));
  assertEquals(count, 1);
  assertEquals(last, 3);
});
