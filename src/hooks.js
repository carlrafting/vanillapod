import debug from './debug.js';
import { traverseChildNodes } from './utils.js';

// const defaultHooks = {};

// element property to store hooks
const key = '_vanillapod_hooks';

function registerHooks(element, { hooks = {} }) {
    if (!hooks) {
        return;
    }

    if (!element[key]) {
        (debug() && console.log(`Registering hooks for ${element}`));
        element[key] = hooks;
        return;
    }

    (debug() && console.log(`Hooks already registered for ${element}`));
}

function registerHook(element, hook) {
    const hooks = element[key];

    if (!hooks[hook]) {
        hooks[hook] = hook;
    }
}

function triggerHook(element, hookName, ...args) {
    const hooks = element[key];

    if (hooks) {
        if (hookName && hooks[hookName]) {
            (debug() && console.log(`Triggering hook ${hookName} for ${element}`));
            hooks[hookName](args);
        }
        return;
    }

    (debug() && console.log(`No hooks registered for ${element}`));
}

function triggerChildrenHooks(el, hookName='') {
    if (hookName === '') {
        // TODO: throw some kind of error?
        return;
    }

    traverseChildNodes(el, (child) => {
        const childHooks = child._vanillapod_hooks;
        if (childHooks && Object.keys(childHooks).length > 0) {
            if (childHooks && childHooks.before) {
                triggerHook(child, hookName);
            }
        }
    });
}

export { 
    triggerHook, 
    registerHooks, 
    registerHook,
    triggerChildrenHooks 
};
