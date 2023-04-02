import { it } from 'node:test';
import assert from 'node:assert';
import debug from '../src/debug.js';
import { createError as error } from '../src/error.js';

it('should throw error with debug enabled', () => {
    debug(true);

    assert.throws(() => {
        return error('This will throw an error...');
    });
});

it('should not throw error with debug disabled', () => {
    // this test is not working as expected...
    debug(false);

    assert.doesNotThrow(() => {
        return error('This will be added to errors array...');
    });
    // console.log(errors);
});
