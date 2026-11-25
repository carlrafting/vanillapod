# Browser tests

These tests run the DOM package in Chromium through Playwright, rather than a
DOM emulator. They use Deno's test runner and resolve Playwright from npm.
Install Chromium once, then run the suite from this directory:

```sh
deno task install-browser
deno task test
```

The test starts the Lume development server with `deno task serve` when one
isn't already listening at `http://localhost:3000`, then imports the same
`/dom/main.js` entry point used by browser consumers.

## Other engines

`playground.test.ts` reads a `BROWSER` environment variable (`chromium` by
default, or `firefox` or `webkit`), because the playground's editor depends on
`contenteditable` behaviour that differs between engines. Install the engine
first (WebKit also needs a few system libraries on Linux; Playwright prints the
`apt` command it wants):

```sh
deno run -A playwright install firefox webkit
BROWSER=firefox deno task test
BROWSER=webkit deno task test
```

Playwright's WebKit is close to Safari but isn't Safari, so iOS and macOS Safari
still need a manual check.
