import { fileURLToPath } from "node:url";

export const baseURL = "http://localhost:3000";
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

// Built once per test run and shared by every test file.
let build: Promise<void> | undefined;

/**
 * Builds the site and serves `_site` with the static server in `serve.ts`.
 * Unlike `lume -s`, it doesn't watch files or live-reload pages, so nothing
 * can reload a page in the middle of a test. Reuses a server that is already
 * running on `baseURL`, such as `deno task serve`.
 */
export async function startServer() {
  if (await isServerReady()) return null;

  build ??= buildSite();
  await build;

  const server = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "serve.ts"],
    cwd: repoRoot,
    stdout: "null",
    stderr: "inherit",
  }).spawn();

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const status = await Promise.race([
      server.status,
      new Promise<Deno.CommandStatus | null>((resolve) =>
        setTimeout(() => resolve(null), 250)
      ),
    ]);
    if (status) {
      throw new Error(
        `Static server exited before becoming ready: ${status.code}`,
      );
    }
    if (await isServerReady()) return server;
  }

  server.kill();
  throw new Error(
    `Static server did not start at ${baseURL} within 30 seconds.`,
  );
}

async function buildSite() {
  const { code } = await new Deno.Command(Deno.execPath(), {
    args: ["task", "build"],
    cwd: repoRoot,
    stdout: "null",
    stderr: "inherit",
  }).output();
  if (code !== 0) throw new Error(`Site build failed with exit code ${code}`);
}

async function isServerReady() {
  try {
    const response = await fetch(baseURL, {
      signal: AbortSignal.timeout(1_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
