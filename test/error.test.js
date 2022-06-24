import { test, expect } from 'vitest';
import debug from '../src/debug';
import error from '../src/error';

test('error with debug enabled', () => {
    debug(true);

    expect(() => {
        error(new Error('This will throw an error...'));
    }).toThrowError();
});

test('error with debug disabled', () => {
    // this test is not working as expected...
    debug(false);

    expect(() => {
        error(new Error('This will be added to errors array...'));
    }).toThrowError();

    // console.log(errors);
});
