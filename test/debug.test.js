import { it } from 'node:test';
import assert from 'node:assert';
import { createDebug } from '../src/debug.js';

it('should do something', () => {
    {
        const debug = createDebug('vanillapod');
        debug('mymethod').log('example');
        const results = performance.measure('perf', () => {
            const arr = [];
            for (let i = 0; i < 1000; i += 1) {
                arr.push(i);
            }
        });
        debug('perf').log(results);
    }
    assert.ok(true);
});
