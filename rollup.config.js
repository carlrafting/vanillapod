import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import pkg from './package.json' assert { type: 'json' };

const { name, version } = pkg;

const input = `./${name}.js`;
const banner = 
`/**
 * ${name}.js 
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
                file: `./dist/${name}.js`,
                format: 'es'
            },
            {
                file: `./dist/${name}.min.js`,
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
                file: `./dist/${name}.es5.js`,
                name,
                format: 'iife'
            },
            {
                file: `./dist/${name}.es5.min.js`,
                format: 'iife',
                name,
                plugins: [
                    terser()
                ] 
            }
        ]
    }
];
