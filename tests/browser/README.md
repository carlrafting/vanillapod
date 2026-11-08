# Browser tests

These tests run the DOM package in Chromium through Playwright, rather than a
DOM emulator. They require Node.js/npm and Deno. From this directory, install
the Node dependency and browser once, then run the suite:

```sh
npm install
npx playwright install chromium
npm test
```

Playwright starts the Lume development server with `deno task serve` and waits
for `http://localhost:3000`. The tests import the same `/dom/main.js` entry
point used by browser consumers.
