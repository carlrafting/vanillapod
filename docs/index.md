---
title: Introduction
description: Tools and utilities that add behavior on top of the HTML you already have.
order: 0
---

Vanillapod is a set of tools for building robust front-ends with the web
platform. Rather than replacing your HTML with a framework, it extends and
augments it, like a layer of enhancement on top of the markup you already have.

Everything is plain HTML, CSS and JavaScript modules with JSDoc types. There is
no build step: load the files from a CDN, import them in Deno, or let your
bundler pick them up.

## What's included

- **`@vanillapod/dom`**: small DOM helpers to create elements (`div`, `button`,
  `h("section.card")`) and enhance elements already in the page (`enhance`).
- **`@vanillapod/state`**: granular reactive state (`signal`, `effect`,
  `derived`, `store`). It has no DOM dependency, so it pairs with
  `@vanillapod/dom` or works on its own.
- **Components**: accessible building blocks such as tabs, dialogs, toasts and
  tooltips. Each one is plain markup and CSS, plus a small module when it needs
  behavior. Browse them on the [components page](/components/).

## Where to go next

- [Getting started](/docs/getting-started/): install `@vanillapod/dom` and
  render your first element.
- [Creating elements](/docs/elements/) and
  [Enhancing markup](/docs/enhancing-markup/): the two ways to work with the
  DOM.
- [State and effects](/docs/state/): keep the page in sync with your data.
- [Using components](/docs/using-components/): add a component to your page.
- [Contributing](/docs/contributing/): run the site and the tests locally.

To see it all working together, try the [task list example](/examples/tasks/) or
experiment in the [playground](/playground/).
