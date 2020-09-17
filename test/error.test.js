/* global test, expect */

import { error, debug } from '../dist/vanillapod';

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
