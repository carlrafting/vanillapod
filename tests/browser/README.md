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
