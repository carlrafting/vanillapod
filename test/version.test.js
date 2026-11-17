import { test } from "node:test";
import assert from "node:assert/strict";
import { version as libVersion } from "../vanillapod.js";
import pkg from "../package.json" with { type: "json" };

test("version strings should match", () =>
  assert.equal(libVersion, pkg.version));

test("deno.json version should match package.json", async () => {
  const { default: denoConfig } = await import("../deno.json", {
    with: { type: "json" },
  });
  assert.equal(denoConfig.version, pkg.version);
});
