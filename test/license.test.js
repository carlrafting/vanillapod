import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('make sure year is up to date', async () => {
    const year = new Date().getFullYear();
    const file = await fs.readFile('./LICENSE', 'utf-8');
    assert(file.includes(year));
});
