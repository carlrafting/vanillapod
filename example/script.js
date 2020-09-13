import container from './components/container.js';
import { mount } from '../src/mount.js';
import debug from '../src/debug.js';

debug(true);

const root = document.getElementById('root');

mount(root, container);
