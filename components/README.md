# Components

Each component lives in its own folder, named in kebab-case, and is made of
plain HTML, CSS and (when it needs behavior) a small ES module. There is no
build step and no framework.

```
components/
  tabs/
    index.vto    demo page for the docs site, not part of the package
    styles.css   styles, always named styles.css
    tabs.js      behavior, only when the component needs any, named after the folder
```

CSS-only components (card, badge, stack, ...) have no `.js` file.

## Two kinds of behavior

Pick by what the component needs.

### Custom element

Use one when the component owns state, attributes or a lifecycle, for example
`theme-toggle`.

- The module exports the class, for example `ThemeToggle`, with a
  `static get tagName()`.
- The module does not register the element. The consumer does:

```js
import { ThemeToggle } from "./theme-toggle.js";

customElements.define(ThemeToggle.tagName, ThemeToggle);
```

### Enhance existing markup

Use an init function when the component only adds behavior to native markup, for
example `tabs`, `dialog` or `table`.

- The module exports `init<Name>(root = document, selector = "<default>")`,
  plural because it scans `root` for every element matching `selector`:
  `initTabs`, `initDialogs`, `initTables`.
- Importing the module has no side effects. Nothing happens until the function
  is called.
- Markup is found through a class or a `data-*` attribute documented on the
  component's demo page.

```js
import { initTabs } from "./tabs.js";

initTabs();
```

### Imperative APIs

When behavior is triggered by code rather than by markup, export a plain
function named after what it does, for example `showToast(message, options)`
from `toast/toast.js`.

## Conventions

- Folder, JS file and tag names are kebab-case and match each other.
- Styles are in `styles.css` next to the component.
- Modules do not touch globals and do not run on import.
- Every component has a demo page, `index.vto`, whose `<script type="module">`
  is the reference for how to use it.

## Dependencies

Most modules have no imports. `tabs`, `tooltip`, `toast` and
`validation-summary` use `enhance` and the element helpers from
`@vanillapod/dom`, imported by its package name. `components/deno.json` maps it
to the local `dom/` package, and the site layout (`document.vto`) adds an import
map that resolves it to `/dom/main.js` in the browser. They need `dom/` to be
served at `/dom/`.

## Documentation pages

Each component's `index.vto` is its documentation page on the site. The
`component` layout (`_includes/layouts/component.vto`) renders the page's own
content as the demo, then adds sections from the front matter and from the
component's files:

```yaml
---
title: "Tabs"
description: "One or two sentences, shown on the card in the list."
tags: [navigation, accessibility, javascript]
usage: |
  Markdown: the markup to write, attributes and options, and how to call the
  module, with a code example.
accessibility: |
  Markdown, usually a list: keyboard support, ARIA and what to watch out for.
customProperties:
  "--tabs-gap": "Space between tabs."
---
```

- `usage`, `accessibility` and `customProperties` are optional. A section is
  left out when its field is missing.
- The custom properties table lists every property the component's stylesheet
  declares or reads with a `var()` fallback, with its default, so it stays in
  sync with the CSS. `customProperties` only adds the descriptions.
- The Source section shows the demo markup, the stylesheets and the scripts,
  read from the component's folder at build time. Files starting with `_` are
  left out.
- Tags build the filter on the list page: each tag gets a page at
  `/components/tags/<tag>/` (`components/tags.page.js`). End the list with `css`
  or `javascript` to say whether the component needs a script.
