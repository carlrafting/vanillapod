import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
// eslint-disable-next-line
// import pkg from './package.json' assert { type: 'json' };
import { readFile } from 'fs/promises';

const pkg = JSON.parse(
    await readFile(new URL('./package.json', import.meta.url))
);

const { name, version } = pkg;

const input = `./${name}.js`;
const banner = `/**
 * ${name}.js 
 * v${version} 
 */`;
const plugins = [json(), resolve()];

export default [
    {
        input,
        plugins: [...plugins],
        output: [
            {
                banner,
                file: `./dist/${name}.js`,
                format: 'es',
            },
            {
                file: `./dist/${name}.min.js`,
                format: 'es',
                plugins: [terser()],
            },
        ],
    },
    {
        input,
        plugins: [
            ...plugins,
            babel({ babelrc: true, babelHelpers: 'bundled' }),
        ],
        output: [
            {
                banner,
                file: `./dist/${name}.es5.js`,
                name,
                format: 'iife',
            },
            {
                file: `./dist/${name}.es5.min.js`,
                format: 'iife',
                name,
                plugins: [terser()],
            },
        ],
    },
];
