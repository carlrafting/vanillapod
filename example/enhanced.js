import container from './enhanced/components/container.js';
import header from './enhanced/components/header.js';
import mount from '../src/mount.js';
import debug from '../src/debug.js';

debug(true);

const root = document.getElementById('root');

mount(
    root,
    container,
    header
);
