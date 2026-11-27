# @vanillapod/state

Granular state for vanillapod: signals, derived values, reactive stores and
effects. It does not touch the DOM, so it runs in browsers, workers, Deno and
Node. Pair it with [`@vanillapod/dom`](../dom/) to update elements. The source
is plain JavaScript with JSDoc types, so there is no build step.

The full guide is in the
[documentation](https://github.com/carlrafting/vanillapod/tree/dev/docs/state.md),
which the project site renders at `/docs/state/`.

## Install

### Deno

```sh
deno add jsr:@vanillapod/state
```

```js
import { effect, signal } from "@vanillapod/state";
```

### Bundler (Vite, webpack, esbuild, Rollup)

```sh
npx jsr add @vanillapod/state
```

### CDN (jsDelivr)

Pin a commit or a tag: branch names are cached by jsDelivr and may be out of
date.

```html
<script type="module">
import {
  effect,
  signal,
} from "https://cdn.jsdelivr.net/gh/carlrafting/vanillapod@<commit-or-tag>/state/main.js";
</script>
```

> **Status:** `@vanillapod/state` has not been published to JSR yet (its version
> is `0.0.0`), so the Deno and bundler commands above will not resolve until the
> first release. The CDN URL works for any commit that contains `state/`.

> **One copy per app:** effects only track signals and stores from the same copy
> of this module. Make sure an app loads `@vanillapod/state` once, from one URL
> or one version.

## Usage

### Stores

`store` returns a reactive object for grouped state. Reading a property inside
an `effect` subscribes the effect to it, and writes re-run only the effects that
read that property. Nested objects and arrays are reactive too:

```js
import { effect, store } from "@vanillapod/state";

const state = store({ title: "Tasks", items: [] });

effect(() => {
  document.title = state.title;
});

const list = document.getElementById("list");
effect(() => {
  list.replaceChildren(
    ...state.items.map((item) => {
      const li = document.createElement("li");
      li.textContent = item.label;
      return li;
    }),
  );
});

state.items.push({ id: 1, label: "First task" });
```

Notifications are batched and run in a microtask. Call `flush()` to apply them
synchronously.

### Signals and effects

For single values, `signal` creates a signal. Call it with no arguments to read,
with a value to set, or with a function to update from the current value.
`effect` runs a function now and again whenever a signal or store property it
read changes, so there are no keys or per-property bindings to wire up:

```js
import { derived, effect, signal } from "@vanillapod/state";
import { enhance } from "@vanillapod/dom";

const count = signal(0);
const double = derived(() => count() * 2);

const element = document.querySelector("div.element");
effect(() => {
  element.textContent = `${count()} (${double()})`;
});
enhance(element, { onclick: () => count((value) => value + 1) });
```

- `count()` reads, `count(5)` sets and `count((n) => n + 1)` updates. The
  updater's return value is the new value, so write `n + 1`, not `n++`. A
  function can't be stored as the value directly (it is treated as an updater):
  wrap it in an object.
- Writes are batched and effects re-run in a microtask, like store
  notifications. Call `flush()` to run them synchronously.
- An effect tracks what it reads on each run, so a branch it no longer takes is
  forgotten. It may return a cleanup function, which runs before the next run
  and on dispose. `effect` returns a dispose function.
- Inside an effect, reading `state.title` or `state.user.name` subscribes to
  that property of an object returned by `store`. Only property reads are
  tracked: adding a key to an object does not re-run an effect that listed its
  keys.
- `derived(fn)` is a read-only signal computed from others. It updates in the
  same flush as the write that changed it, so an effect that reads both a signal
  and a value derived from it may run once per step in that flush. Call its
  `dispose()` to stop it.
- `untracked(fn)` reads without subscribing the running effect.

## Types

Types come from JSDoc comments in the source. Editors and `deno check` read them
directly, so there are no separate `.d.ts` files to generate or keep up to date.
