import { assertEquals, assertStrictEquals } from "@std/assert";
import { bind, bindList, createStore, flush } from "./state.js";

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

  store.items = [{ id: 2 }];
  flush();
  assertEquals(disposed, 1);
  assertEquals(parent.children.length, 1);
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
