import { test } from 'node:test';
import assert from 'node:assert/strict';
import { version as libVersion } from '../vanillapod.js';
import pkg from '../package.json' assert { type: 'json' };

test("version strings should match", () => assert.equal(libVersion, pkg.version));
