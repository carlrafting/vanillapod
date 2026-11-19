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
const scheduler = { pending: new Set(), scheduled: false };

/** @param {any} value */
function isPlain(value) {
  if (value === null || typeof value !== "object") return false;
  return Array.isArray(value) ||
    Object.getPrototypeOf(value) === Object.prototype;
}

/** @param {any} value */
function toRaw(value) {
  return raws.get(value) ?? value;
}

/** @param {any} raw */
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

/** @param {{ run: () => void; active: boolean }} sub */
function schedule(sub) {
  scheduler.pending.add(sub);
  if (!scheduler.scheduled) {
    scheduler.scheduled = true;
    queueMicrotask(flush);
  }
}

// Subscribers on ANY (e.g. bindList watching an array's contents) run on every
// write to the object, not only writes to a specific key.
/**
 * @param {object} raw
 * @param {PropertyKey} key
 */
function notify(raw, key) {
  const map = channels.get(raw);
  if (!map) return;
  for (const subs of [map.get(key), map.get(ANY)]) {
    if (subs) { for (const sub of subs) schedule(sub); }
  }
}

/**
 * @param {object} raw
 * @param {PropertyKey} key
 * @param {() => void} run
 */
function subscribe(raw, key, run) {
  // The proxy sees property keys as strings, so `bind(list, 0)` must too.
  if (typeof key === "number") key = String(key);
  let map = channels.get(raw);
  if (!map) channels.set(raw, map = new Map());
  let subs = map.get(key);
  if (!subs) map.set(key, subs = new Set());

  const sub = { run, active: true };
  subs.add(sub);
  return () => {
    sub.active = false;
    subs.delete(sub);
  };
}

/** @type {ProxyHandler<any>} */
const handler = {
  get(target, key, receiver) {
    const value = Reflect.get(target, key, receiver);
    // A frozen property must be returned as is, or the Proxy throws.
    const desc = Reflect.getOwnPropertyDescriptor(target, key);
    if (desc && !desc.configurable && !desc.writable) return value;
    return wrap(value);
  },
  set(target, key, value) {
    const next = toRaw(value);
    const prev = toRaw(target[key]);
    const prevLength = Array.isArray(target) ? target.length : 0;
    const ok = Reflect.set(target, key, next);
    if (ok && !Object.is(prev, next)) notify(target, key);
    // Writing past the end grows the array without a write to `length`.
    if (
      ok && key !== "length" && Array.isArray(target) &&
      target.length !== prevLength
    ) {
      notify(target, "length");
    }
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
 *
 * @returns {void}
 */
export function flush() {
  while (scheduler.pending.size) {
    const batch = [...scheduler.pending];
    scheduler.pending.clear();
    for (const sub of batch) {
      if (!sub.active) continue;
      try {
        sub.run();
      } catch (error) {
        console.error(error);
      }
    }
  }
  scheduler.scheduled = false;
}

/**
 * Creates a reactive store. Nested objects and arrays are reactive too.
 *
 * @template T
 * @param {T} initial
 * @returns {T}
 */
export function createStore(initial = /** @type {T} */ ({})) {
  return /** @type {T} */ (wrap(initial));
}

/**
 * Runs `updater` now and again only when `source[key]` is written.
 *
 * @param {any} source - a store or nested store object
 * @param {PropertyKey} key
 * @param {(value: any) => void} updater
 * @returns {() => void} dispose function
 */
export function bind(source, key, updater) {
  updater(source[key]);
  return subscribe(toRaw(source), key, () => updater(source[key]));
}

/**
 * Renders an array as a keyed list. Items are reused while their key holds the
 * same object, and only removed or moved when needed. Each reused item's own
 * bindings are untouched by list changes. When a key gets a different object,
 * the old item is disposed and the new object is rendered in its place.
 *
 * The `parent` element is owned by the list: all of its children are managed
 * here, and items are kept in array order at the end of `parent`. Do not place
 * other children in `parent`, or they may be moved past.
 *
 * @param {any} source - store or nested store object holding the array
 * @param {PropertyKey} key - property holding the array
 * @param {object} options
 * @param {Element} options.parent - element that contains the rendered items
 * @param {(item: any, index: number) => PropertyKey} [options.key] - unique key per item
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
  /** @type {Map<PropertyKey, { item: any; node: any; dispose(): void }>} */
  const entries = new Map();
  /** @type {any} */
  let arrayRaw;
  /** @type {(() => void) | null} */
  let unsubscribeArray = null;

  /** @param {any} item */
  const createEntry = (item) => {
    /** @type {(() => void)[]} */
    const cleanups = [];
    const node = render(item, {
      onCleanup: (fn) => cleanups.push(fn),
    });
    return {
      item: toRaw(item),
      node,
      dispose() {
        for (const fn of cleanups) fn();
      },
    };
  };

  /** @param {any} list */
  const reconcile = (list) => {
    /** @type {any[]} */
    const items = list ?? [];
    const keys = items.map((
      /** @type {any} */ item,
      /** @type {number} */ index,
    ) => keyOf(item, index));
    const seen = new Set();
    for (const itemKey of keys) {
      if (seen.has(itemKey)) {
        throw new Error(`bindList: duplicate key ${String(itemKey)}`);
      }
      seen.add(itemKey);
    }

    const next = new Map();
    /** @type {{ item: any; node: any; dispose(): void }[]} */
    const ordered = [];
    items.forEach((/** @type {any} */ item, /** @type {number} */ index) => {
      const itemKey = keys[index];
      const existing = entries.get(itemKey);
      const entry = existing && Object.is(existing.item, toRaw(item))
        ? existing
        : createEntry(item);
      next.set(itemKey, entry);
      ordered.push(entry);
    });

    for (const [itemKey, entry] of entries) {
      if (next.get(itemKey) !== entry) {
        entry.dispose();
        entry.node.remove();
      }
    }

    entries.clear();
    for (const [itemKey, entry] of next) entries.set(itemKey, entry);

    /** @type {any} */
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
