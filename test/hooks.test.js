import { test } from 'vitest';
import { triggerHook } from '../src';

test('triggerHook should throw an error if key does not exist on element', () => {
    triggerHook(window, 'update', { value: 123 });
});
