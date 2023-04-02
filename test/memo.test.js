import { it } from 'node:test';
import assert from 'node:assert/strict';
import { memo } from '../src/state.js';

it('should work as expected with simple values', () => {
    const m = memo((value) => value);

    for (const num of [1, 2, 3, 4, 5]) {
        m(num);
        assert.equal(m(num), num);
    }
});
