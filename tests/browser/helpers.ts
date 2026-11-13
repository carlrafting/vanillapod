import { fileURLToPath } from "node:url";

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
