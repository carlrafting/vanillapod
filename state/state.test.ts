import { assertEquals, assertStrictEquals } from "@std/assert";
import { derived, effect, flush, signal, store, untracked } from "./main.js";

Deno.test("an effect runs once immediately and again only for the keys it read", () => {
  const state = store({ count: 0, other: 0 });
  const seen: number[] = [];
  effect(() => {
    seen.push(state.count);
  });

  state.other = 1;
  flush();
  assertEquals(seen, [0]);

  state.count = 2;
  flush();
  assertEquals(seen, [0, 2]);
});

Deno.test("writes of equal values do not notify", () => {
  const state = store({ count: 1 });
  let runs = 0;
  effect(() => {
    state.count;
    runs++;
  });

  state.count = 1;
  flush();
  assertEquals(runs, 1);
});

Deno.test("writes in one tick are batched into a single update", async () => {
  const state = store({ count: 0 });
  let runs = 0;
  effect(() => {
    state.count;
    runs++;
  });

  state.count = 1;
  state.count = 2;
  state.count = 3;
  await Promise.resolve();
  assertEquals(runs, 2);
});

Deno.test("nested objects are reactive and keep proxy identity", () => {
  const state = store({ user: { name: "a" } });
  const seen: string[] = [];
  effect(() => {
    seen.push(state.user.name);
  });

  assertStrictEquals(state.user, state.user);
  state.user.name = "b";
  flush();
  assertEquals(seen, ["a", "b"]);
});

Deno.test("an effect on an array length follows push, pop and truncation", () => {
  const state = store({ items: [] as string[] });
  const seen: number[] = [];
  effect(() => {
    seen.push(state.items.length);
  });

  state.items.push("a");
  flush();
  state.items.push("b");
  flush();
  state.items.pop();
  flush();
  state.items.length = 0;
  flush();
  assertEquals(seen, [0, 1, 2, 1, 0]);
});

Deno.test("writes made while flushing are applied in the same flush", () => {
  const state = store({ a: 0, b: 0 });
  const seen: number[] = [];
  effect(() => {
    state.b = state.a * 10;
  });
  effect(() => {
    seen.push(state.b);
  });

  state.a = 2;
  flush();
  assertEquals(seen, [0, 20]);
});

Deno.test("an effect on an array index follows writes to that index", () => {
  const state = store({ items: ["a", "b"] });
  const seen: string[] = [];
  effect(() => {
    seen.push(state.items[0]);
  });

  state.items[0] = "c";
  flush();
  assertEquals(seen, ["a", "c"]);
});

Deno.test("replacing a nested array re-runs effects that read its items", () => {
  const state = store({ items: [{ id: 1 }, { id: 2 }] });
  const seen: number[][] = [];
  effect(() => {
    seen.push(state.items.map((item) => item.id));
  });

  state.items = [{ id: 2 }, { id: 3 }];
  flush();
  state.items.push({ id: 4 });
  flush();
  assertEquals(seen, [[1, 2], [2, 3], [2, 3, 4]]);
});

Deno.test("frozen nested objects can be read from a store", () => {
  const settings = Object.freeze({ theme: { name: "dark" } });
  const state = store({ settings });
  assertStrictEquals(state.settings.theme, settings.theme);
  assertEquals(state.settings.theme.name, "dark");
});

Deno.test("signal reads, sets and updates", () => {
  const count = signal(0);
  assertEquals(count(), 0);
  assertEquals(count(5), 5);
  assertEquals(count((value: number) => value + 1), 6);
  assertEquals(count(), 6);
});

Deno.test("signal can be set to undefined and ignores equal writes", () => {
  const value = signal<number | undefined>(1);
  const seen: unknown[] = [];
  effect(() => {
    seen.push(value());
  });
  value(1);
  flush();
  value(undefined);
  flush();
  assertEquals(seen, [1, undefined]);
});

Deno.test("effect runs now, then when a signal it read changes", () => {
  const count = signal(0);
  const seen: number[] = [];
  effect(() => {
    seen.push(count());
  });
  assertEquals(seen, [0]);
  count((value: number) => value + 1);
  flush();
  assertEquals(seen, [0, 1]);
});

Deno.test("effect batches writes made in one tick", async () => {
  const count = signal(0);
  const seen: number[] = [];
  effect(() => {
    seen.push(count());
  });
  count(1);
  count(2);
  count(3);
  await Promise.resolve();
  assertEquals(seen, [0, 3]);
});

Deno.test("effect only tracks what it reads, including after a branch change", () => {
  const useA = signal(true);
  const a = signal("a");
  const b = signal("b");
  const seen: string[] = [];
  effect(() => {
    seen.push(useA() ? a() : b());
  });
  b("b2");
  flush();
  assertEquals(seen, ["a"]);
  useA(false);
  flush();
  a("a2");
  flush();
  assertEquals(seen, ["a", "b2"]);
  b("b3");
  flush();
  assertEquals(seen, ["a", "b2", "b3"]);
});

Deno.test("effect cleanup runs before the next run and on dispose", () => {
  const count = signal(0);
  const log: string[] = [];
  const dispose = effect(() => {
    const value = count();
    log.push(`run ${value}`);
    return () => log.push(`cleanup ${value}`);
  });
  count(1);
  flush();
  dispose();
  count(2);
  flush();
  assertEquals(log, ["run 0", "cleanup 0", "run 1", "cleanup 1"]);
});

Deno.test("effect tracks store properties and nested objects", () => {
  const state = store({ title: "a", user: { name: "x" }, other: 0 });
  const seen: string[] = [];
  effect(() => {
    seen.push(`${state.title}/${state.user.name}`);
  });
  state.other = 1;
  flush();
  assertEquals(seen, ["a/x"]);
  state.user.name = "y";
  flush();
  state.title = "b";
  flush();
  assertEquals(seen, ["a/x", "a/y", "b/y"]);
});

Deno.test("effect follows array length and index reads", () => {
  const state = store({ items: [1, 2] });
  const seen: number[] = [];
  effect(() => {
    seen.push(state.items.length);
  });
  state.items.push(3);
  flush();
  assertEquals(seen, [2, 3]);
});

Deno.test("untracked reads do not subscribe the effect", () => {
  const a = signal(1);
  const b = signal(10);
  const seen: number[] = [];
  effect(() => {
    seen.push(a() + untracked(() => b()));
  });
  b(20);
  flush();
  assertEquals(seen, [11]);
  a(2);
  flush();
  assertEquals(seen, [11, 22]);
});

Deno.test("derived computes from signals and updates in the same flush", () => {
  const count = signal(1);
  const double = derived(() => count() * 2);
  const seen: number[] = [];
  effect(() => {
    seen.push(double());
  });
  assertEquals(double(), 2);
  count(2);
  flush();
  assertEquals(double(), 4);
  assertEquals(seen.at(-1), 4);
  double.dispose();
  count(3);
  flush();
  assertEquals(double(), 4);
});

Deno.test("an effect that throws on a later run does not stop others", () => {
  const count = signal(0);
  const seen: number[] = [];
  const original = console.error;
  console.error = () => {};
  try {
    effect(() => {
      if (count() === 1) throw new Error("boom");
    });
    effect(() => {
      seen.push(count());
    });
    count(1);
    flush();
  } finally {
    console.error = original;
  }
  assertEquals(seen, [0, 1]);
});
