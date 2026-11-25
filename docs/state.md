---
title: State and effects
description: Keep the page in sync with your data using signals, derived values, stores and effects.
order: 4
---

`@vanillapod/dom` has a small, granular reactivity system. You keep data in
**signals** or a **store**, and write **effects** that read it and update the
DOM. When the data changes, only the effects that read that piece of data run
again. There are no keys, templates or per-property bindings to wire up.

## Signals

`signal(initial)` holds one value. Call it with no arguments to read, with a
value to set, or with a function to update from the current value:

```js
import { signal } from "@vanillapod/dom";

const count = signal(0);

count(); // 0
count(5); // set to 5
count((n) => n + 1); // update to 6
```

- The updater's return value becomes the new value, so write `n + 1`, not
  `n++`.
- A function can't be stored as the value directly, because it's treated as an
  updater. Wrap it in an object instead: `signal({ fn })`.
- Setting the same value (compared with `Object.is`) does nothing.

## Effects

`effect(fn)` runs `fn` now, and again whenever a signal or store property it
read changes:

```js
import { effect, enhance, signal } from "@vanillapod/dom";

const count = signal(0);
const output = document.querySelector("output");
const button = document.querySelector("#increment");

effect(() => {
  output.textContent = String(count());
});

enhance(button, { onclick: () => count((n) => n + 1) });
```

- An effect tracks what it reads on each run, so a branch it no longer takes is
  forgotten.
- `fn` may return a cleanup function. It runs before the next run and when the
  effect is disposed, which is the place to remove timers or listeners.
- `effect` returns a dispose function that stops the effect.

```js
const seconds = signal(1000);

const stop = effect(() => {
  const id = setInterval(() => console.log("tick"), seconds());
  return () => clearInterval(id);
});

seconds(500); // the old interval is cleared and a new one starts
stop(); // the interval is cleared and the effect stops
```

## Derived values

`derived(fn)` is a read-only signal computed from other signals and store
properties:

```js
import { derived, effect, signal } from "@vanillapod/dom";

const count = signal(2);
const double = derived(() => count() * 2);

effect(() => {
  console.log(`${count()} doubled is ${double()}`);
});
```

A derived value updates in the same flush as the write that changed it. An
effect that reads both a signal and a value derived from it may run once per
step in that flush. Call `double.dispose()` to stop it.

## Stores

For grouped state, `createStore(initial)` returns a reactive object. Reading a
property inside an effect subscribes to that property, and writing it re-runs
only the effects that read it. Nested objects and arrays are reactive too:

```js
import { createStore, effect, li } from "@vanillapod/dom";

const store = createStore({ title: "Tasks", items: [] });

effect(() => {
  document.title = store.title;
});

const list = document.getElementById("list");
effect(() => {
  list.replaceChildren(...store.items.map((item) => li(item.label)));
});

store.items.push({ id: 1, label: "First task" });
store.title = "Tasks (1)";
```

Only property reads are tracked. Adding a key to an object doesn't re-run an
effect that listed its keys with `Object.keys`.

## Batching and flush()

Writes don't run effects straight away. They are batched, and the effects that
need to run do so once, in a microtask. Several writes in a row therefore
update the DOM once:

```js
count(1);
count(2);
count(3); // the effect runs once, with 3
```

Call `flush()` to run pending effects synchronously, for example in a test or
before measuring the DOM:

```js
import { flush } from "@vanillapod/dom";

count(10);
flush();
console.log(output.textContent); // "10"
```

An error thrown in an effect during a flush is logged with `console.error`, and
the other effects still run.

## Reading without tracking

`untracked(fn)` runs `fn` and returns its result without subscribing the
running effect to what it reads:

```js
import { effect, untracked } from "@vanillapod/dom";

effect(() => {
  // Re-runs when count changes, but not when step does.
  console.log(count() * untracked(() => step()));
});
```

For a complete app built this way, see the [task list example](/examples/tasks/).
