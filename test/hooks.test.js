import { test } from 'node:test';
import assert from 'node:assert/strict';
import { triggerHook } from '../src/hooks.js';
import debug from '../src/debug.js';

test('triggerHook should throw an error if key does not exist on object', () => {
    debug(true);
    const el = {};
    assert.throws(() => {
        triggerHook(el, 'update', { value: 123 });
        console.log({ el });
    });
});
