import { readFile } from 'node:fs/promises';

export const parseJSONFile = async (name) => JSON.parse(
    await readFile(new URL(name, import.meta.url))
);
