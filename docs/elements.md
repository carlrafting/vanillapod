---
title: Creating elements
description: Build elements with the element helpers and h(), then add them to the page with render().
order: 2
---

## Element helpers

Each common HTML element has a helper with the same name: `div`, `p`, `h1` to
`h6`, `a`, `button`, `span`, `ul`, `li`, `form`, `input`, `label` and so on.
Pass an optional props object first, then any number of children:

```js
import { a, li, ul } from "@vanillapod/dom";

const list = ul(
  { className: "links" },
  li(a({ href: "/docs/" }, "Docs")),
  li(a({ href: "/components/" }, "Components")),
);
```

Children can be strings, numbers, DOM nodes or other helper results. Strings and
numbers are added as text, never parsed as HTML.

## Props

The props object works the same way for every helper, for `h()` and for
[`enhance()`](/docs/enhancing-markup/):

| Key | What happens |
| --- | --- |
| `on<event>`, for example `onclick` | Added as an event listener for the lowercased event name |
| `on: { "my-event": handler }` | Each entry is added as a listener, with the name exactly as written |
| `dataset: { state: "idle" }` | Merged into the element's `dataset` |
| `class` | Sets the `class` attribute |
| Keys with a dash, for example `aria-label` or `data-id` | Set as attributes |
| `innerHTML` | Ignored, so markup can't be injected through props |
| Anything else, for example `id`, `value`, `type` or `hidden` | Assigned as a DOM property |

```js
import { button } from "@vanillapod/dom";

const save = button(
  {
    type: "button",
    class: "button primary",
    "aria-describedby": "save-help",
    dataset: { state: "idle" },
    onclick: () => console.log("saving"),
  },
  "Save",
);
```

Listeners can take options or be `handleEvent` objects; see
[Event listeners](/docs/enhancing-markup/#event-listeners).

## Creating from a selector

`h(selector, props, ...children)` creates an element from a CSS-like selector: a
tag name (default `div`), an optional `#id` and any number of `.class` names.
Unlike the helpers, it can create any tag, including custom elements and tags
that have no helper.

```js
import { h, render } from "@vanillapod/dom";

render([
  h("section.card.wide#main", { "aria-live": "polite" }, "Saved"),
  h("theme-toggle"),
  h(".note", "A div with the class note"),
], document.body);
```

- A props `id` overrides the selector's id. A props `class` is kept alongside
  the selector's classes.
- Attribute selectors such as `[type=text]` aren't supported: use props.
- An empty or invalid selector throws a `TypeError`.
- Namespaced elements such as SVG aren't supported.

## Text and comments

`text(value)` creates a text node and `comment(value)` creates a comment node,
for when you need the node itself, for example to update its `data` later.

```js
import { p, text } from "@vanillapod/dom";

const count = text("0");
const status = p("Items: ", count);
count.data = "3";
```

## Rendering

`render(mountables, root)` appends an array of elements to `root`:

```js
import { div, p, render } from "@vanillapod/dom";

const isAdmin = false;

render(
  [
    p("Welcome back"),
    isAdmin && div({ className: "admin-panel" }, "Admin tools"),
  ],
  document.getElementById("app"),
);
```

- `null`, `undefined` and booleans are skipped, so `condition && element()` is
  safe.
- `mountables` can also be a function that returns an element or an array.
- `root` can be an element or a function that returns one. If there is no root,
  `render` throws an `Error`.
- `render` appends and never clears `root`. To replace what is there, call
  `root.replaceChildren()` first.
