import { test } from 'node:test';
import assert from 'node:assert/strict';
import { version as libVersion } from '../vanillapod.js';
/* eslint-disable */
import pkg from '../package.json' assert { type: 'json' };
/* eslint-enable */

test('version strings should match', () =>
    assert.equal(libVersion, pkg.version));
