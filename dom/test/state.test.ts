import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { bind, bindList, createStore, flush } from "../src/state.js";

// Minimal stand-in for the DOM operations bindList relies on.
class FakeParent {
  children: FakeNode[] = [];
  insertBefore(node: FakeNode, ref: FakeNode | null) {
    node.remove();
    const index = ref ? this.children.indexOf(ref) : this.children.length;
    this.children.splice(index, 0, node);
    node.parentNode = this;
  }
}

class FakeNode {
  parentNode: FakeParent | null = null;
  constructor(public label: string) {}
  get nextSibling(): FakeNode | null {
    if (!this.parentNode) return null;
    const siblings = this.parentNode.children;
    return siblings[siblings.indexOf(this) + 1] ?? null;
  }
  remove() {
    if (!this.parentNode) return;
    const siblings = this.parentNode.children;
    siblings.splice(siblings.indexOf(this), 1);
    this.parentNode = null;
  }
}

Deno.test("bind runs once immediately and again only for its own key", () => {
  const store = createStore({ count: 0, other: 0 });
  const seen: number[] = [];
  bind(store, "count", (value: number) => seen.push(value));

  store.other = 1;
  flush();
  assertEquals(seen, [0]);

  store.count = 2;
  flush();
  assertEquals(seen, [0, 2]);
});

Deno.test("writes of equal values do not notify", () => {
  const store = createStore({ count: 1 });
  let runs = 0;
  bind(store, "count", () => runs++);

  store.count = 1;
  flush();
  assertEquals(runs, 1);
});

Deno.test("writes in one tick are batched into a single update", async () => {
  const store = createStore({ count: 0 });
  let runs = 0;
  bind(store, "count", () => runs++);

  store.count = 1;
  store.count = 2;
  store.count = 3;
  await Promise.resolve();
  assertEquals(runs, 2);
});

Deno.test("nested objects are reactive and keep proxy identity", () => {
  const store = createStore({ user: { name: "a" } });
  const seen: string[] = [];
  bind(store.user, "name", (value: string) => seen.push(value));

  assertStrictEquals(store.user, store.user);
  store.user.name = "b";
  flush();
  assertEquals(seen, ["a", "b"]);
});

Deno.test("bindList reuses item nodes and only removes missing keys", () => {
  const store = createStore({ items: [{ id: 1 }, { id: 2 }] });
  const parent = new FakeParent();
  const created: string[] = [];
  bindList(store, "items", {
    parent: parent as unknown as Element,
    key: (item: { id: number }) => item.id,
    render: (item: { id: number }) => {
      created.push(String(item.id));
      return new FakeNode(String(item.id)) as unknown as Node;
    },
  });
  const [first, second] = parent.children;

  store.items.unshift({ id: 3 });
  flush();
  assertEquals(created, ["1", "2", "3"]);
  assertEquals(parent.children.map((n) => n.label), ["3", "1", "2"]);
  assertStrictEquals(parent.children[1], first);
  assertStrictEquals(parent.children[2], second);

  store.items.splice(1, 1);
  flush();
  assertEquals(created, ["1", "2", "3"]);
  assertEquals(parent.children.map((n) => n.label), ["3", "2"]);
});

Deno.test("bindList disposes item bindings when items are removed", () => {
  const store = createStore({ items: [{ id: 1 }, { id: 2 }] });
  const parent = new FakeParent();
  let disposed = 0;
  bindList(store, "items", {
    parent: parent as unknown as Element,
    key: (item: { id: number }) => item.id,
    render: (
      _item: unknown,
      { onCleanup }: { onCleanup: (fn: () => void) => void },
    ) => {
      onCleanup(() => disposed++);
      return new FakeNode("x") as unknown as Node;
    },
  });

  store.items = store.items.filter((item: { id: number }) => item.id === 2);
  flush();
  assertEquals(disposed, 1);
  assertEquals(parent.children.length, 1);
});

Deno.test("bindList renders a new object that replaces an item with the same key", () => {
  const store = createStore({ items: [{ id: 1, done: false }] });
  const parent = new FakeParent();
  const rendered: { id: number; done: boolean }[] = [];
  let disposed = 0;
  bindList(store, "items", {
    parent: parent as unknown as Element,
    key: (item: { id: number }) => item.id,
    render: (
      item: { id: number; done: boolean },
      { onCleanup }: { onCleanup: (fn: () => void) => void },
    ) => {
      rendered.push(item);
      onCleanup(() => disposed++);
      return new FakeNode(String(item.done)) as unknown as Node;
    },
  });

  store.items = [{ id: 1, done: true }];
  flush();
  assertEquals(disposed, 1);
  assertEquals(parent.children.map((n) => n.label), ["true"]);
  assertStrictEquals(rendered[1], store.items[0]);
});

Deno.test("bind on an array length follows push, pop and truncation", () => {
  const store = createStore({ items: [] as string[] });
  const seen: number[] = [];
  bind(store.items, "length", (value: number) => seen.push(value));

  store.items.push("a");
  flush();
  store.items.push("b");
  flush();
  store.items.pop();
  flush();
  store.items.length = 0;
  flush();
  assertEquals(seen, [0, 1, 2, 1, 0]);
});

Deno.test("bindList rejects duplicate keys without rendering or touching the DOM", () => {
  const store = createStore({ items: [{ id: 1 }, { id: 1 }, { id: 2 }] });
  const parent = new FakeParent();
  let created = 0;
  assertThrows(
    () =>
      bindList(store, "items", {
        parent: parent as unknown as Element,
        key: (item: { id: number }) => item.id,
        render: (item: { id: number }) => {
          created++;
          return new FakeNode(String(item.id)) as unknown as Node;
        },
      }),
    Error,
    "duplicate key 1",
  );
  assertEquals(created, 0);
  assertEquals(parent.children.length, 0);
});

Deno.test("item edits do not re-run list reconciliation", () => {
  const store = createStore({ items: [{ id: 1, done: false }] });
  const parent = new FakeParent();
  let reconciles = 0;
  bindList(store, "items", {
    parent: parent as unknown as Element,
    key: (item: { id: number }) => item.id,
    render: () => new FakeNode("x") as unknown as Node,
    onUpdate: () => reconciles++,
  });

  store.items[0].done = true;
  flush();
  assertEquals(reconciles, 1);
});

Deno.test("bindList follows sort and replacement of a nested array", () => {
  const store = createStore({ user: { items: [{ id: 1 }, { id: 2 }] } });
  const parent = new FakeParent();
  bindList(store.user, "items", {
    parent: parent as unknown as Element,
    key: (item: { id: number }) => item.id,
    render: (item: { id: number }) =>
      new FakeNode(String(item.id)) as unknown as Node,
  });

  store.user.items.sort((a: { id: number }, b: { id: number }) => b.id - a.id);
  flush();
  assertEquals(parent.children.map((n) => n.label), ["2", "1"]);

  store.user.items = [{ id: 3 }];
  flush();
  assertEquals(parent.children.map((n) => n.label), ["3"]);
});

Deno.test("disposing a list from another binding does not throw on flush", () => {
  const store = createStore({ items: [{ id: 1 }], open: true });
  const parent = new FakeParent();
  const dispose = bindList(store, "items", {
    parent: parent as unknown as Element,
    key: (item: { id: number }) => item.id,
    render: () => new FakeNode("x") as unknown as Node,
  });
  bind(store, "open", (open: boolean) => {
    if (!open) dispose();
  });

  store.open = false;
  store.items.push({ id: 2 });
  flush();
  assertEquals(parent.children.length, 0);
});

Deno.test("writes made while flushing are applied in the same flush", () => {
  const store = createStore({ a: 0, b: 0 });
  const seen: number[] = [];
  bind(store, "a", (value: number) => {
    store.b = value * 10;
  });
  bind(store, "b", (value: number) => seen.push(value));

  store.a = 2;
  flush();
  assertEquals(seen, [0, 20]);
});

Deno.test("bind with a numeric key follows writes to that array index", () => {
  const store = createStore({ items: ["a", "b"] });
  const seen: string[] = [];
  bind(store.items, 0, (value: string) => seen.push(value));

  store.items[0] = "c";
  flush();
  assertEquals(seen, ["a", "c"]);
});

Deno.test("frozen nested objects can be read from a store", () => {
  const settings = Object.freeze({ theme: { name: "dark" } });
  const store = createStore({ settings });
  assertStrictEquals(store.settings.theme, settings.theme);
  assertEquals(store.settings.theme.name, "dark");
});
