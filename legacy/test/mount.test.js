import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import mount, { init } from "../src/mount.js";

// mount.js relies on the browser `Node` global for instanceof checks.
const hadNode = "Node" in globalThis;

class FakeNode {
  constructor(name) {
    this.name = name;
    this.children = [];
  }
  insertBefore(child) {
    this.children.push(child);
  }
}

describe("mount", () => {
  beforeEach(() => {
    globalThis.Node = FakeNode;
  });

  afterEach(() => {
    if (!hadNode) delete globalThis.Node;
  });

  it("init resolves function, object, array and Node arguments", () => {
    const component = () => ({ el: new FakeNode("x") });
    const [fn] = init(component, undefined, {});
    assert.equal(fn, component);

    const [fromObject] = init({ el: new FakeNode("y") }, undefined, {});
    assert.equal(typeof fromObject, "function");

    const props = { id: 1 };
    const [fromArray, fromArrayProps] = init([component, props], undefined, {});
    assert.equal(fromArray, component);
    assert.equal(fromArrayProps, props);

    const node = new FakeNode("z");
    const [fromNode] = init(node, undefined, {});
    assert.deepEqual(fromNode(), { el: node });
  });

  it("inserts the component element into the root", () => {
    const root = new FakeNode("root");
    const el = new FakeNode("button");
    mount(root, () => ({ el }));
    assert.deepEqual(root.children, [el]);
  });

  it("mounts children into the element before inserting it", () => {
    const root = new FakeNode("root");
    const child = new FakeNode("child");
    const parent = new FakeNode("parent");
    mount(root, () => ({ el: parent, children: [() => ({ el: child })] }));
    assert.deepEqual(parent.children, [child]);
    assert.deepEqual(root.children, [parent]);
  });

  it("runs before, then the mount hook after insertion", () => {
    const root = new FakeNode("root");
    const el = new FakeNode("el");
    const calls = [];
    mount(root, () => ({
      el,
      hooks: {
        before: () => calls.push(["before", root.children.length]),
        mount: () => calls.push(["mount", root.children.length]),
      },
    }));
    assert.deepEqual(calls, [
      ["before", 0],
      ["mount", 1],
    ]);
  });

  it("mounts components with unknown keys and ignores those keys", () => {
    const root = new FakeNode("root");
    const el = new FakeNode("p");
    mount(root, () => ({ el, txt: "typo" }));
    assert.deepEqual(root.children, [el]);
  });

  it("inserts nothing when a component does not return an object", () => {
    const root = new FakeNode("root");
    mount(root, () => "not an object");
    assert.equal(root.children.length, 0);
  });

  it("inserts nothing for values it cannot interpret", () => {
    const root = new FakeNode("root");
    mount(root, 42);
    assert.equal(root.children.length, 0);
  });
});
