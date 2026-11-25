---
title: Enhancing markup
description: Add behavior to elements that are already in the page with enhance().
order: 3
---

Most of a page is often written as HTML, by hand or by a server. Rather than
recreating it in JavaScript, `enhance()` adds props, listeners and children to
the elements that are already there.

## enhance()

`enhance(element, props, ...children)` takes the same params as the
[element helpers](/docs/elements/) but applies them to an existing element, and
returns that element. Children are appended after its current content.

```html
<button id="save" type="button">Save</button>
```

```js
import { enhance } from "@vanillapod/dom";

enhance(document.querySelector("#save"), {
  onclick: save,
  dataset: { state: "idle" },
  "aria-busy": "false",
});
```

The props follow the [same rules](/docs/elements/#props) as when creating an
element: `on<event>` adds a listener, `dataset` is merged, `class` sets the
class attribute, keys with a dash become attributes, and everything else is
assigned as a property.

Write the HTML so that it works before the script runs, for example a form that
submits to the server or a link that goes somewhere. Then `enhance()` makes it
better, and the page still works if the script fails to load.

## Event listeners

A listener can be a function, as in `onclick: save`. It can also be:

- **A `[handler, options]` pair.** The options are passed to
  `addEventListener`, so you can use `once`, `capture`, `passive` or `signal`:

  ```js
  const controller = new AbortController();

  enhance(element, {
    onclick: [save, { once: true }],
    onscroll: [track, { passive: true, signal: controller.signal }],
  });

  // Later: remove the scroll listener.
  controller.abort();
  ```

- **An object with a `handleEvent` method**, as `addEventListener` allows.
  Inside it, `this` is the object, so one object can handle several events and
  keep its own state:

  ```js
  const widget = {
    count: 0,
    handleEvent(event) {
      if (event.type === "click") this.count++;
      if (event.type === "keydown" && event.key === "Escape") this.count = 0;
    },
  };

  enhance(element, { on: { click: widget, keydown: widget } });
  ```

## Custom events

`on<event>` keys are lowercased, so `onItemAdded` listens for `itemadded`. To
listen for an event whose name has a dash or capitals, use the `on` prop. Its
keys are used exactly as written:

```js
enhance(list, {
  on: { "item-added": refresh },
});

list.dispatchEvent(new CustomEvent("item-added", { detail: { id: 1 } }));
```

## Enhancing many elements

`enhance()` works on one element. To enhance every match, loop over
`querySelectorAll`. This is the pattern the
[components](/docs/using-components/) use in their `init*()` functions:

```js
import { enhance } from "@vanillapod/dom";

export function initCounters(root = document, selector = "[data-counter]") {
  for (const element of root.querySelectorAll(selector)) {
    let count = 0;
    enhance(element, {
      onclick: () => (element.dataset.count = String(++count)),
    });
  }
}
```

Next, use [state and effects](/docs/state/) to keep these elements in sync with
your data.
