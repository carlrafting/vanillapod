import { registerHooks, triggerHook } from './hooks.js';
import { createError } from './error.js';
import { checkType } from './utils.js';
import { createElement, createComponentInstance } from './element.js';
import debug from './debug.js';

export default function mount(root, ...args) {
    let index = 0;
    let vanillapodComponent;
    let props = {};
    const argsLength = args.length;

    for (; index < argsLength; index += 1) {
        const arg = args[index];

        [vanillapodComponent, props] = init(arg, vanillapodComponent, props);

        if (!vanillapodComponent) {
            return createError('Could not determine component format');
        }

        const instance = createComponentInstance(vanillapodComponent, props);

        // console.log({ instance });

        if (!instance) {
            return createError(
                `Could not create instance for ${vanillapodComponent}`
            );
        }

        let { el, element } = instance;

        if (!el) {
            el = element;
            element = null;
            // delete instance.element;
        }

        // if el is a string, use implicit render approach
        if (checkType(el) === 'string') {
            const props = createElement(el, instance);
            el = props.el || props.element;
        }

        registerHooks(el, instance);

        const hooks = el._vanillapod_hooks;

        // trigger element before hook
        if (hooks && hooks.before) {
            triggerHook(el, 'before');
        }

        if (instance.children && instance.children.length > 0) {
            mount(el, ...instance.children);
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
    }
}

export function init(arg, vanillapodComponent, props) {
    // console.log({arg, vanillapodComponent, props});
    checkType(arg) === 'array' && ([vanillapodComponent, props] = arg);
    checkType(arg) === 'function' && (vanillapodComponent = arg);
    checkType(arg) === 'asyncfunction' && (vanillapodComponent = arg);
    checkType(arg) === 'object' && (vanillapodComponent = () => arg);
    arg instanceof Node && (vanillapodComponent = () => ({ el: arg }));
    return [vanillapodComponent, props];
}
