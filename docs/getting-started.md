---
title: Getting started
description: Install @vanillapod/dom and render your first element.
order: 1
---

`@vanillapod/dom` runs in the browser and needs a `document`. Its source is
plain JavaScript with JSDoc types, so you can import it as it is.

> **Status:** `@vanillapod/dom` has not been published to JSR yet (its version
> is `0.0.0`), so the Deno and bundler commands below will not resolve until
> the first release. The CDN URL works for any commit that contains `dom/`.

## Install

### CDN (jsDelivr)

Load the entry point as an ES module. Pin a commit or a tag: jsDelivr caches
branch names, so they may be out of date.

```html
<script type="module">
  import {
    button,
    render,
  } from "https://cdn.jsdelivr.net/gh/carlrafting/vanillapod@<commit-or-tag>/dom/main.js";

  render([button({ onclick: () => alert("hi") }, "Say hi")], document.body);
</script>
```

Replace `<commit-or-tag>` with the commit or tag you want. The package imports
no bare specifiers, so you don't need an import map.

### Deno

```sh
deno add jsr:@vanillapod/dom
```

### Bundler (Vite, webpack, esbuild, Rollup)

Install it through JSR's npm-compatible registry, then import it like any npm
package:

```sh
npx jsr add @vanillapod/dom
```

## Your first render

Give the page an element to render into:

```html
<div id="app"></div>
```

Then create elements with the helpers and append them with `render`:

```js
import { button, h1, p, render } from "@vanillapod/dom";

render(
  [
    h1("Hello"),
    p("This paragraph was created with @vanillapod/dom."),
    button({ onclick: () => alert("Clicked!") }, "Click me"),
  ],
  document.getElementById("app"),
);
```

`render(mountables, root)` appends the elements to `root`. It throws an `Error`
if `root` is missing, which usually means the selector didn't match or the
script ran before the element was parsed. `type="module"` scripts are deferred,
so they run after the document has been parsed.

## Types

Types come from the JSDoc comments in the source. Editors and `deno check` read
them directly, so there are no `.d.ts` files to install.

Next, see [Creating elements](/docs/elements/) for everything the helpers can do.
