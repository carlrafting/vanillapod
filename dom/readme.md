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

`render(mountables, root)` appends the elements to `root` and attaches event
handlers at the root. It returns a `destroy(position?)` function that removes
the children, or only the child at `position`.

`buildElement(tagName, props)` creates a single element from a props object
(`classList`, `attributes`, `props`, `data`, `text`, `on`) and returns
`{ element, el, ...props }`.

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

Invalid input throws an `Error`, for example `render` without a root,
`traverseChildNodes` without a parent, or `destroy` with a non-number position.

## Types

Types come from JSDoc comments in the source. Editors and `deno check` read them
directly, so there are no separate `.d.ts` files to generate or keep up to date.
