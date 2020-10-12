import { registerHooks, triggerChildrenHooks, triggerHook } from './hooks.js';
import error from './error.js';
import { checkType } from './utils.js';
import { elementHelper, registerElement } from './element.js';
import setElementChildren from './children.js';

/**
 * mount
 * 
 * @param {HTMLElement} root - parent element to mount elements to
 * @param {*} args - components to mount  
 */
export default function mount(root, ...args) {
    args.forEach(arg => {
        if (checkType(arg) !== 'function') {
            error(new Error('arg must be a function'));
        }

        const elementCreatorFunction = arg;
        const instance = registerElement(elementCreatorFunction);
        let { el, element } = instance;

        if (!el) {
            el = element;
            element = null;
        }

        // if el is a string, use implicit render approach
        if (checkType(el) === 'string') {
            el = elementHelper(instance);
            setElementChildren(el, instance);
            registerHooks(el, instance);
        }

        const hooks = el._vanillapod_hooks;
        
        // trigger children before hooks
        triggerChildrenHooks(el, 'before');

        // trigger element before hook
        if (hooks && hooks.before) {
            triggerHook(el, 'before');
        }

        // mount element to root or document body element

        if (root) {
            root.insertBefore(el, null);
        }

        if (!root) {
            const body = document.querySelector('body');
            body.insertBefore(el, body.lastChild);
        }        

        // trigger element mount hook
        if (hooks && hooks.mount) {
            triggerHook(el, 'mount');
        }

        // trigger children mount hooks
        triggerChildrenHooks(el, 'mount');
    });
}
