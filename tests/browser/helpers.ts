import { fileURLToPath } from "node:url";
import type { Page } from "playwright";

export const baseURL = "http://localhost:3000";
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
export async function startServer() {
  if (await isServerReady()) return null;

  const server = new Deno.Command(Deno.execPath(), {
    args: ["task", "serve"],
    cwd: repoRoot,
    stdout: "null",
    stderr: "inherit",
  }).spawn();

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const status = await Promise.race([
      server.status,
      new Promise<Deno.CommandStatus | null>((resolve) => setTimeout(() => resolve(null), 250)),
    ]);
    if (status) {
      throw new Error(
        `Lume server exited before becoming ready: ${status.code}`,
      );
    }
    if (await isServerReady()) return server;
  }

  server.kill();
  throw new Error(
    `Lume server did not start at ${baseURL} within 120 seconds.`,
  );
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

const artifactsDir = fileURLToPath(new URL("./artifacts/", import.meta.url));

/**
 * Saves a full-page screenshot to tests/browser/artifacts/, which CI uploads
 * when the job fails. Never throws, so it can't hide the original failure.
 */
export async function saveFailure(page: Page, name: string) {
  try {
    await Deno.mkdir(artifactsDir, { recursive: true });
    const file = name.replace(/[^a-z0-9]+/gi, "-").slice(0, 80);
    await page.screenshot({
      path: `${artifactsDir}${file}-${Date.now()}.png`,
      fullPage: true,
    });
  } catch (err) {
    console.error(`Could not save a failure screenshot: ${err}`);
  }
}

/** `t.step` that saves a screenshot of the shared page when the step fails. */
export function stepWithShot(
  t: Deno.TestContext,
  page: Page,
  name: string,
  fn: () => Promise<void>,
) {
  return t.step(name, async () => {
    try {
      await fn();
    } catch (err) {
      await saveFailure(page, name);
      throw err;
    }
  });
}
