# @vanillapod/dom

DOM helpers and granular state for vanillapod. It runs in the browser and needs
a `document`. The source is plain JavaScript with JSDoc types, so there is no
build step: you can import it directly from a CDN, or let a bundler use it.

The full guide is in the
[documentation](https://github.com/carlrafting/vanillapod/tree/dev/docs), which
the project site renders at `/docs/`.

## Install

### Deno

```sh
deno add jsr:@vanillapod/dom
```

```js
import { button, render, span } from "@vanillapod/dom";
```

### Bundler (Vite, webpack, esbuild, Rollup)

Install it through the JSR npm-compatible registry:

```sh
npx jsr add @vanillapod/dom
```

Then import it like any npm package:

```js
import { button, render } from "@vanillapod/dom";
```

### CDN (jsDelivr)

Load the entry point as an ES module. Pin a commit or a tag: branch names are
cached by jsDelivr and may be out of date.

```html
<script type="module">
import {
  button,
  render,
} from "https://cdn.jsdelivr.net/gh/carlrafting/vanillapod@<commit-or-tag>/dom/main.js";

render([button({ onclick: () => alert("hi") }, "Say hi")], document.body);
</script>
```

Replace `<commit-or-tag>` with the commit or tag you want. The package does not
import any bare specifiers, so no import map is needed.

> **Status:** `@vanillapod/dom` has not been published to JSR yet (its version
> is `0.0.0`), so the Deno and bundler commands above will not resolve until the
> first release. The CDN URL works for any commit that contains `dom/`.

## Usage

### Elements

Each HTML element has a helper: `div`, `p`, `h1`, `button`, `span`, `input` and
so on. Pass an optional props object first, then children (strings, nodes or
other helper results). Event handlers use `on<event>` keys:

```js
import { button, div, render, span } from "@vanillapod/dom";

let count = 0;

render(
  [
    div(
      button({ onclick: () => count++ }, span("Click me")),
    ),
  ],
  document.getElementById("app"),
);
```

`render(mountables, root)` appends the elements to `root`. Entries that are
`null`, `undefined` or a boolean are skipped, so `isAdmin && panel()` is safe.

A props object sets DOM properties on the element, such as `className`, `id`,
`value` or `type`. Keys starting with `on` that hold a function are added to the
element as event listeners. `dataset` is merged into the element's dataset,
`class` sets the class attribute, and keys with a dash (`aria-*`, `data-*`) are
set as attributes. `innerHTML` is not allowed through props.

### Creating from a selector

`h(selector, props, ...children)` creates an element from a CSS-like selector: a
tag name (default `div`), an optional `#id` and any number of `.class` names.
Unlike the helpers above it can create any tag, including custom elements and
tags that have no helper.

```js
import { h, render } from "@vanillapod/dom";

render([
  h("section.card.wide#main", { "aria-live": "polite" }, "Saved"),
  h("theme-toggle", { autodetect: true }),
  h("table.data"),
], document.body);
```

The props and children work like the helpers. A props `id` overrides the
selector's id, and a props `class` is kept alongside the selector's classes.
Attributes such as `[type=text]` are not part of the selector: use props. An
empty or invalid selector throws a `TypeError`. Namespaced elements such as SVG
are not supported.

### Existing elements

`enhance(element, props, ...children)` takes the same params as the element
helpers but applies them to an element that is already in the document, and
returns it. Children are appended.

```js
import { enhance } from "@vanillapod/dom";

enhance(document.querySelector("#save"), {
  onclick: save,
  dataset: { state: "idle" },
  "aria-busy": "false",
});
```

Props are assigned as properties, with a few conveniences: `on<event>` adds a
listener, `dataset` is merged into the element's dataset, `class` sets the class
attribute, and keys with a dash (`aria-*`, `data-*`) are set as attributes.

Pass `[handler, options]` to give a listener options such as `once`, `capture`
or `passive`. The `on` prop takes a map of event names, used exactly as written,
which is how you listen for custom events:

```js
enhance(element, {
  onclick: [save, { once: true }],
  on: { "item-added": refresh },
});
```

A handler can also be an object with a `handleEvent` method, as
`addEventListener` allows. `this` is that object, so one object can handle
several events:

```js
const widget = {
  count: 0,
  handleEvent(event) {
    if (event.type === "click") this.count++;
  },
};

enhance(element, { on: { click: widget, keydown: widget } });
```

To apply the same params to several elements, pass a list, such as a `NodeList`
or an array. `enhance` returns them as an array. Every element gets the same
listeners, so use `event.currentTarget` to tell them apart. Children must be
strings or numbers, since one node can't be in several places:

```js
enhance(document.querySelectorAll("[data-copy]"), {
  onclick: (event) =>
    navigator.clipboard.writeText(event.currentTarget.dataset.copy),
});
```

### State

`store` returns a reactive object for grouped state. Reading a property inside
an `effect` subscribes the effect to it, and writes re-run only the effects that
read that property. Nested objects and arrays are reactive too:

```js
import { effect, store } from "@vanillapod/dom";

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
import { derived, effect, enhance, signal } from "@vanillapod/dom";

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

## Errors

Invalid input throws, for example `render` without a root throws an `Error`, and
`h` with an empty or invalid selector throws a `TypeError`. `enhance` throws a
`TypeError` for anything that isn't an element or a list of elements, and for a
node child passed with a list, before changing any element.

## Types

Types come from JSDoc comments in the source. Editors and `deno check` read them
directly, so there are no separate `.d.ts` files to generate or keep up to date.
