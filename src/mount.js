import bootstrap from '../src/bootstrap.js';
import { triggerHook } from './hooks.js';
import debug from './debug.js';

// mount to DOM
export default function mount(root, ...args) {
    args.forEach(arg => {
        const elementCreatorFunction = arg;
        const { element } = bootstrap(elementCreatorFunction);
        const hooks = element._vanillapod_hooks;

        if (root) {
            root.appendChild(element);
        }

        if (!root) {
            const body = document.querySelector('body');
            body.appendChild(element);
        }        

        debug() && console.log('hooks', hooks);

        if (hooks && hooks['mount']) {
            triggerHook(element, 'mount');
        }
    });
}
