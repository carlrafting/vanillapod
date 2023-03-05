import { test, expect } from 'vitest';
import { memo } from '../src';

test('works as expected', () => {
    const m = memo((value) => {
        console.log(value);
        return value;
    });

    for (const num of [1, 2, 3, 4, 5]) {
        m(num);
        expect(m(num)).toBe(num);
    }
});
