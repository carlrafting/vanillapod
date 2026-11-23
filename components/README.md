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

- The module exports `init<Name>(root = document)`, plural because it scans
  `root` for every match: `initTabs`, `initDialogs`, `initTables`.
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
