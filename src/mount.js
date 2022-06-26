import { registerHooks, triggerHook } from './hooks.js';
import error from './error.js';
import { checkType } from './utils.js';
import { elementHelper, registerElement } from './element.js';

/**
 * mount
 * 
 * @param {HTMLElement} root - parent element to mount elements to
 * @param {*} args - components to mount
 */
export default function mount(root, ...args) {
    let index = 0;
    let vanillapodComponent;
    let props = {};
    const argsLength = args.length;

    for (; index < argsLength; (index += 1)) {
        const arg = args[index];

        checkType(arg) === 'array' && ([vanillapodComponent, props] = arg);
        checkType(arg) === 'function' && (vanillapodComponent = arg);
        checkType(arg) === 'object' && (vanillapodComponent = () => arg);

        if (!vanillapodComponent) {
            return error(new Error('Could not determine component format'));
        }

        const instance = registerElement(vanillapodComponent, props);

        if (!instance) {
            return error(new Error(`Could not create instance for ${vanillapodComponent}`));
        }

        let { el, element } = instance;

        if (!el) {
            el = element;
            element = null;
            // delete instance.element;
        }

        // if el is a string, use implicit render approach
        if (checkType(el) === 'string') {
            el = elementHelper(instance);
        }

        if (instance.children && instance.children.length > 0) {
            mount(el, ...instance.children);
        }

        registerHooks(el, instance);

        const hooks = el._vanillapod_hooks;
        
        // trigger children before hooks
        // triggerChildrenHooks(el, 'before');

        // trigger element before hook
        if (hooks && hooks.before) {
            triggerHook(el, 'before');
        }

        // mount element to root
        if (root) {
            root.insertBefore(el, null);
        }

        // mount element to document body
        if (!root && document.body) {
            document.body.insertBefore(el, document.body.lastChild);
        }        

        // trigger element mount hook
        if (hooks && hooks.mount) {
            triggerHook(el, 'mount');
        }
        
        // trigger children mount hooks
        // triggerChildrenHooks(el, 'mount');
    }
}
