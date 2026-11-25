# vanillapod

Tools and utilities for HTML augmentation. Vanillapod adds behavior on top of
the HTML you already have, using plain HTML, CSS and JavaScript modules with no
build step.

## Packages

- [`@vanillapod/dom`](dom/): DOM helpers (`div`, `h()`, `enhance()`,
  `render()`) and granular reactive state (`signal`, `effect`, `derived`,
  `createStore`).
- [Components](components/): accessible building blocks such as tabs, dialogs,
  toasts and tooltips, each made of markup, a `styles.css` file and, where
  needed, a small ES module.

## Documentation

The guide lives in [`docs/`](docs/) and is published as part of the site:

- [Introduction](docs/index.md)
- [Getting started](docs/getting-started.md)
- [Creating elements](docs/elements.md)
- [Enhancing markup](docs/enhancing-markup.md)
- [State and effects](docs/state.md)
- [Using components](docs/using-components.md)
- [Contributing](docs/contributing.md)

## Development

You need [Deno](https://deno.com) 2.

```sh
deno task serve
```

This serves the documentation site, with the component demos, the
[task list example](examples/tasks/) and the playground, at
`http://localhost:3000`. `deno task build` writes a production build to
`_site/`.

```sh
cd dom/test && deno test -A
```

```sh
cd tests/browser && deno task install-browser && deno task test
```

See [Contributing](docs/contributing.md) for details.

## License

MIT. See [`license`](license).
