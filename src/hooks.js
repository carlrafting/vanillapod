import debug from './debug.js';
import { createError } from './error.js';

// const defaultHooks = {};

// element property to store hooks
const key = '_vanillapod_hooks';

function registerHooks(element, { hooks = {} }) {
    if (!hooks) {
        return;
    }

    if (!element[key]) {
        debug() && console.log(`Registering hooks for ${element}`);
        element[key] = hooks;
        return;
    }

    debug() && console.log(`Hooks already registered for ${element}`);
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
            debug() &&
                console.log(`Triggering hook ${hookName} for ${element}`);
            hooks[hookName](...args);
        }
        return;
    }

    createError(`No hook named '${hookName}' registered for ${element}`);
}

export { triggerHook, registerHooks, registerHook };
