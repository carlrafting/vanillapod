---
title: Using components
description: Add a vanillapod component to your page, with its styles and, where it has one, its module.
order: 5
---

Each [component](/components/) is a folder of plain files: the markup to write,
a `styles.css` file and, when the component needs behavior, a small ES module
named after the folder. Every component page has a demo, usage notes, the
custom properties you can set and the full source.

## 1. Add the styles

Link the component's stylesheet, or copy it into your own CSS:

```html
<link rel="stylesheet" href="/components/tabs/styles.css">
```

Many components are CSS only (card, badge, stack, cluster and others). For
those, the markup and the stylesheet are all you need.

## 2. Write the markup

Copy the markup from the component's page. Components that add behavior find
their elements by a class or a `data-*` attribute, which the page documents.
For example, tabs use the `.tabs` class.

## 3. Add the behavior

Components with a module use one of three styles. Importing a module never does
anything by itself: you decide when to run it.

### Init functions

Components that only add behavior to native markup export an
`init<Name>s(root = document, selector)` function. It finds every matching
element under `root` and enhances it:

```js
import { initTabs } from "/components/tabs/tabs.js";
import { initDialogs } from "/components/dialog/dialog.js";

initTabs();
initDialogs();
```

Pass a `root` to enhance only part of the page, for example content you just
inserted, or a `selector` to use your own class:

```js
initTabs(document.querySelector("#settings"), ".settings-tabs");
```

The components that work this way are copy button, dialog, password input,
table, tabs, tooltip and validation summary.

### Custom elements

Components that own their own state, attributes or lifecycle are custom
elements. The module exports the class, and you register it, so you control the
tag name and when it's defined:

```js
import { ThemeToggle } from "/components/theme-toggle/theme-toggle.js";

if (!customElements.get(ThemeToggle.tagName)) {
  customElements.define(ThemeToggle.tagName, ThemeToggle);
}
```

### Imperative functions

When behavior is started by your code rather than by markup, the module exports
a function named after what it does. For example, `showToast` adds a message to
a `.toasts` region:

```js
import { showToast } from "/components/toast/toast.js";

showToast("Saved", { variant: "success", timeout: 3000 });
```

## Resolving @vanillapod/dom

Tabs, tooltip, toast and validation summary import `@vanillapod/dom` by its
package name. In Deno, `components/deno.json` maps that name to the local
`dom/` package. In the browser, add an import map before your first module
script so the name resolves to wherever you serve `dom/main.js`:

```html
<script type="importmap">
  { "imports": { "@vanillapod/dom": "/dom/main.js" } }
</script>
```

This site's layout does the same. To load from jsDelivr instead, point the map
at the same commit or tag as the components:

```html
<script type="importmap">
  {
    "imports": {
      "@vanillapod/dom": "https://cdn.jsdelivr.net/gh/carlrafting/vanillapod@<commit-or-tag>/dom/main.js"
    }
  }
</script>
```

The other components have no imports and need no import map.

## Customizing

Components read CSS custom properties with sensible defaults. Set them on the
component, or on any ancestor, to change how it looks:

```css
.tabs {
  --tabs-gap: 0.5rem;
}
```

Each component page lists the properties it reads, with their defaults.
