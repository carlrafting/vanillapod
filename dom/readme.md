# @vanillapod/dom

DOM helpers and granular state for vanillapod. It runs in the browser and needs
a `document`. The source is plain JavaScript with JSDoc types, so there is no
build step: you can import it directly from a CDN, or let a bundler use it.

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
element as event listeners. For attributes or `data-*` values, set them in your
own code with `setAttribute` or `dataset`. `innerHTML` is not allowed through
props.

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

### State

`createStore` returns a reactive object. Writes to it re-run only the bindings
that read that property:

```js
import { bind, bindList, createStore } from "@vanillapod/dom";

const store = createStore({ title: "Tasks", items: [] });

bind(store, "title", (value) => {
  document.title = value;
});

bindList(store, "items", {
  parent: document.getElementById("list"),
  key: (item) => item.id,
  render: (item) => {
    const li = document.createElement("li");
    li.textContent = item.label;
    return li;
  },
});

store.items.push({ id: 1, label: "First task" });
```

Notifications are batched and run in a microtask. Call `flush()` to apply them
synchronously.

## Errors

Invalid input throws an `Error`, for example `render` without a root, or
`traverseChildNodes` without a parent.

## Types

Types come from JSDoc comments in the source. Editors and `deno check` read them
directly, so there are no separate `.d.ts` files to generate or keep up to date.
