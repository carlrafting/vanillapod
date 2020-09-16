import { terser } from 'rollup-plugin-terser';
import buble from '@rollup/plugin-buble';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const bundleName = 'vanillapod';
const input = './vanillapod.js';

export default [
    {
        input,
        output: [
            {
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
            babel({ babelHelpers: 'bundled' }),
            resolve()
        ],
        output: [
            {
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
