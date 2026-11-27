---
title: Contributing
description: Run the site and the tests locally, and add or document a component.
order: 6
---

The repository is a [Deno](https://deno.com) workspace. The documentation site
is built with [Lume](https://lume.land), and its pages double as demos and test
fixtures.

## Repository layout

| Folder                           | What it holds                                                                            |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `dom/`                           | The `@vanillapod/dom` package: `main.js`, its source in `src/` and unit tests in `test/` |
| `state/`                         | The `@vanillapod/state` package, laid out the same way as `dom/`                         |
| `components/`                    | One folder per component, each with its demo page                                        |
| `docs/`                          | These guide pages, in Markdown                                                           |
| `examples/`                      | Small apps built with the package, such as the task list                                 |
| `playground/`                    | The in-browser editor at [/playground/](/playground/)                                    |
| `tests/browser/`                 | Playwright tests that run the package and the site in a real browser                     |
| `_includes/`, `_lib/`, `assets/` | Site layouts, build helpers and shared styles                                            |

## Running the site

Install Deno 2, then from the repository root:

```sh
deno task serve
```

This builds the site and serves it at `http://localhost:3000`, rebuilding when
files change. `deno task build` writes a production build to `_site/`.

## Running the tests

Unit tests for each package live in its `test/` folder, which has its own
config:

```sh
cd dom/test && deno test -A
```

```sh
cd state/test && deno test -A
```

Browser tests run in Chromium through Playwright. Install the browser once, then
run the suite. It starts the development server if one isn't already running:

```sh
cd tests/browser && deno task install-browser && deno task test
```

See `tests/browser/README.md` for running them in Firefox and WebKit.

## What CI checks

On every push to `main` or `dev`, and on pull requests, CI:

- checks formatting of the packages with `deno fmt --check dom state`,
- runs the unit tests in `dom/test` and `state/test`,
- type-checks the packages with `deno publish --dry-run`,
- builds the site and runs the browser tests.

## Component conventions

- Each component lives in a kebab-case folder. The folder, JS file and tag names
  match.
- Styles go in `styles.css` next to the component.
- Behavior, when needed, goes in a module named after the folder. Modules don't
  touch globals and don't run on import. They export a custom element class, an
  `init<Name>s(root, selector)` function or an imperative function. See
  [Using components](/docs/using-components/).
- Every component has a demo page, `index.vto`, whose `<script type="module">`
  is the reference for how to use it.

`components/README.md` has the full guide.

## Documenting a component

A component's `index.vto` is its page on the site. Its content is the demo, and
the rest of the page comes from the front matter and the component's files:

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
- The custom properties table is read from the stylesheet, so it stays in sync
  with the CSS. `customProperties` only adds the descriptions.
- The source section shows the files in the component's folder. Files starting
  with `_` are left out.
- End `tags` with `css` or `javascript` to say whether the component needs a
  script.

## Writing a guide page

Guide pages are Markdown files in `docs/`. They use the `docs` layout, which
builds the sidebar and the previous/next links from each page's front matter:

```yaml
---
title: State and effects
description: One sentence, shown under the page title.
order: 4
---
```

`order` sets the page's position in the sidebar. Start the content at `##`,
because the layout renders `title` as the page's `h1`.
