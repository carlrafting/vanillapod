import { assert, assertEquals, assertFalse } from "@std/assert";
import {
  checkType,
  createLocalStorage,
  debounce,
  delay,
  isEqual,
} from "./utils.js";

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

function withFakeLocalStorage(run: (store: Map<string, string>) => void) {
  const store = new Map<string, string>();
  const fake = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
  };
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    value: fake,
    configurable: true,
  });
  try {
    run(store);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete (globalThis as { localStorage?: unknown }).localStorage;
  }
}

Deno.test("createLocalStorage round-trips JSON data under its key", () => {
  withFakeLocalStorage((store) => {
    const storage = createLocalStorage("tasks");
    storage.write([{ id: "a", done: false }]);
    assertEquals(store.get("tasks"), '[{"id":"a","done":false}]');
    assertEquals(storage.read(), [{ id: "a", done: false }]);
  });
});

Deno.test("createLocalStorage read returns initialData when nothing is saved", () => {
  withFakeLocalStorage(() => {
    assertEquals(createLocalStorage("missing", { count: 0 }).read(), {
      count: 0,
    });
    assertEquals(createLocalStorage("missing").read(), null);
  });
});

Deno.test("createLocalStorage read falls back to initialData for an empty array", () => {
  withFakeLocalStorage(() => {
    const storage = createLocalStorage("list", ["seed"]);
    storage.write([]);
    assertEquals(storage.read(), ["seed"]);
  });
});
