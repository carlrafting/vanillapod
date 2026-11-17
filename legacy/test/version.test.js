import { test } from "node:test";
import assert from "node:assert/strict";
import { version as libVersion } from "../vanillapod.js";
import denoConfig from "../deno.json" with { type: "json" };

test("version strings should match", () =>
  assert.equal(libVersion, denoConfig.version));
