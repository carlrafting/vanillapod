// Removes the generated .d.ts files before `npm run types` regenerates them.
// TypeScript resolves `./foo.js` to an existing `./foo.d.ts`, so stale
// declarations would otherwise be read instead of type-checking the JS sources.
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

rmSync(join(root, "vanillapod.d.ts"), { force: true });

for (const file of readdirSync(join(root, "src"))) {
  if (file.endsWith(".d.ts")) {
    rmSync(join(root, "src", file), { force: true });
  }
}
