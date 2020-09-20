import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { version } from './package.json';

const bundleName = 'vanillapod';
const input = './vanillapod.js';
const banner = 
`/**
 * vanillapod.js 
 * v${version} 
 */`;

export default [
    {
        input,
        plugins: [
            json()
        ],
        output: [
            {
                banner,
                file: './dist/vanillapod.js',
                format: 'es'
            },
            {
                file: './dist/vanillapod.min.js',
                format: 'es',
                plugins: [
                    terser()
                ]
            }
        ]
    },
    {
        input,
        plugins: [
            json(),
            babel({ babelHelpers: 'bundled' }),
            resolve()
        ],
        output: [
            {
                banner,
                file: './dist/vanillapod.es5.js',
                name: bundleName,
                format: 'iife'
            },
            {
                file: './dist/vanillapod.es5.min.js',
                format: 'iife',
                name: bundleName,
                plugins: [
                    terser()
                ] 
            }
        ]
    }
];
