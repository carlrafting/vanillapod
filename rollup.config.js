import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { readFile } from 'fs/promises';

const { name, version } = JSON.parse(
    await readFile(new URL('./package.json', import.meta.url))
);

const input = `./${name}.js`;
const banner = `/**
 * ${name}.js 
 * v${version} 
 */`;
const plugins = [json(), resolve()];
const file = (suffix) => `./dist/${name}${suffix ? suffix : ''}.js`;
const format = 'es';

export default {
    input,
    plugins: [...plugins],
    output: [
        {
            banner,
            file: file('.development'),
            format,
        },
        {
            banner,
            file: file('.production'),
            format,
        },
    ],
};
