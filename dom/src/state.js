/**
 * Granular state for vanillapod.
 *
 * Plain objects and arrays are wrapped in a Proxy. Subscriptions are keyed by
 * (object, property), so a write only re-runs the bindings that read that
 * exact property. Notifications are batched and flushed in a microtask (or
 * synchronously via `flush`).
 */

const ANY = Symbol("any");
const proxies = new WeakMap();
const raws = new WeakMap();
const channels = new WeakMap();
const pending = new Set();
let scheduled = false;

function isPlain(value) {
  if (value === null || typeof value !== "object") return false;
  return Array.isArray(value) ||
    Object.getPrototypeOf(value) === Object.prototype;
}

function toRaw(value) {
  return raws.get(value) ?? value;
}

function wrap(raw) {
  if (!isPlain(raw) || raws.has(raw)) return raw;
  let proxy = proxies.get(raw);
  if (!proxy) {
    proxy = new Proxy(raw, handler);
    proxies.set(raw, proxy);
    raws.set(proxy, raw);
  }
  return proxy;
}

function schedule(sub) {
  pending.add(sub);
  if (!scheduled) {
    scheduled = true;
    queueMicrotask(flush);
  }
}

function notify(raw, key) {
  const map = channels.get(raw);
  if (!map) return;
  for (const subs of [map.get(key), map.get(ANY)]) {
    if (subs) { for (const sub of subs) schedule(sub); }
  }
}

function subscribe(raw, key, run) {
  let map = channels.get(raw);
  if (!map) channels.set(raw, map = new Map());
  let subs = map.get(key);
  if (!subs) map.set(key, subs = new Set());

  const sub = { run, active: true };
  subs.add(sub);
  return () => {
    sub.active = false;
    subs.delete(sub);
    pending.delete(sub);
  };
}

const handler = {
  get(target, key, receiver) {
    return wrap(Reflect.get(target, key, receiver));
  },
  set(target, key, value) {
    const next = toRaw(value);
    const prev = toRaw(target[key]);
    const ok = Reflect.set(target, key, next);
    if (ok && !Object.is(prev, next)) notify(target, key);
    return ok;
  },
  deleteProperty(target, key) {
    const had = Object.hasOwn(target, key);
    const ok = Reflect.deleteProperty(target, key);
    if (had && ok) notify(target, key);
    return ok;
  },
};

/**
 * Runs all pending binding updates. Called automatically in a microtask after
 * writes; call it directly to apply updates synchronously.
 */
export function flush() {
  while (pending.size) {
    const batch = [...pending];
    pending.clear();
    for (const sub of batch) {
      if (!sub.active) continue;
      try {
        sub.run();
      } catch (error) {
        console.error(error);
      }
    }
  }
  scheduled = false;
}

/**
 * Creates a reactive store. Nested objects and arrays are reactive too.
 *
 * @template T
 * @param {T} initial
 * @returns {T}
 */
export function createStore(initial = {}) {
  return wrap(initial);
}

/**
 * Runs `updater` now and again only when `source[key]` is written.
 *
 * @param {object} source - a store or nested store object
 * @param {PropertyKey} key
 * @param {(value: any) => void} updater
 * @returns {() => void} dispose function
 */
export function bind(source, key, updater) {
  updater(source[key]);
  return subscribe(toRaw(source), key, () => updater(source[key]));
}

/**
 * Renders an array as a keyed list. Items are created once per key, reused
 * when the array changes, and only removed or moved when needed. Each item's
 * own bindings are untouched by list changes.
 *
 * The `parent` element is owned by the list: its children are managed here.
 *
 * @param {object} source - store or nested store object holding the array
 * @param {PropertyKey} key - property holding the array
 * @param {object} options
 * @param {Element} options.parent - element that contains the rendered items
 * @param {(item: any) => PropertyKey} [options.key] - unique key per item
 * @param {(item: any, context: { onCleanup: (fn: () => void) => void }) => Node} options.render
 * @param {(list: any) => void} [options.onUpdate] - called after each reconcile
 * @returns {() => void} dispose function
 */
export function bindList(source, key, {
  parent,
  key: keyOf = (item) => item,
  render,
  onUpdate,
}) {
  const entries = new Map();
  let arrayRaw;
  let unsubscribeArray = null;

  const createEntry = (item) => {
    const cleanups = [];
    const node = render(item, {
      onCleanup: (fn) => cleanups.push(fn),
    });
    return {
      node,
      dispose() {
        for (const fn of cleanups) fn();
      },
    };
  };

  const reconcile = (list) => {
    const next = new Map();
    const ordered = [];
    let index = 0;
    for (const item of list ?? []) {
      const itemKey = keyOf(item, index++);
      const entry = entries.get(itemKey) ?? createEntry(item);
      next.set(itemKey, entry);
      ordered.push(entry);
    }

    for (const [itemKey, entry] of entries) {
      if (!next.has(itemKey)) {
        entry.dispose();
        entry.node.remove();
      }
    }

    entries.clear();
    for (const [itemKey, entry] of next) entries.set(itemKey, entry);

    let ref = null;
    for (let i = ordered.length - 1; i >= 0; i--) {
      const { node } = ordered[i];
      if (node.parentNode !== parent || node.nextSibling !== ref) {
        parent.insertBefore(node, ref);
      }
      ref = node;
    }
  };

  const attachArray = () => {
    const next = toRaw(source[key]);
    if (next === arrayRaw) return;
    unsubscribeArray?.();
    arrayRaw = next;
    unsubscribeArray = isPlain(arrayRaw)
      ? subscribe(arrayRaw, ANY, update)
      : null;
  };

  const update = () => {
    attachArray();
    const list = source[key];
    reconcile(list);
    onUpdate?.(list);
  };

  const unsubscribeKey = subscribe(toRaw(source), key, update);
  update();

  return () => {
    unsubscribeKey();
    unsubscribeArray?.();
    for (const entry of entries.values()) {
      entry.dispose();
      entry.node.remove();
    }
    entries.clear();
  };
}
