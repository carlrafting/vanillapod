import { terser } from 'rollup-plugin-terser';
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';

// const bundleName = 'vanillapod';
const babelOutputPluginOptions = { 
    plugins: ['transform-es2015-modules-umd'],
    presets: ['@babel/preset-env'] 
}; 

export default {
    input: 'src/index.js',
    plugins: [
        babel({
            babelHelpers: 'bundled'
        })
    ],
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
        },
        {
            file: './dist/vanillapod.umd.js',
            format: 'es',
            plugins: [
                getBabelOutputPlugin(babelOutputPluginOptions)
            ]
        },
        {
            file: './dist/vanillapod.umd.min.js',
            format: 'es',
            plugins: [
                getBabelOutputPlugin(babelOutputPluginOptions),
                terser()
            ]
        }
    ]
};
