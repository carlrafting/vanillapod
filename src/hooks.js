import debug from './debug.js';

function registerHooks(element, { hooks = {} }) {
    if (!hooks) {
        return;
    }

    const key = '_vanillapod_hooks';

    if (!element[key]) {
        (debug() && console.log(`Registering hooks for ${element}`));
        element[key] = hooks;
        return;
    }

    (debug() && console.log(`Hooks already registered for ${element}`));
}

function registerHook(element, hook) {
    const hooks = element._vanillapod_hooks;

    if (!hooks[hook]) {
        hooks[hook] = hook;
    }
}

function triggerHook(element, hookName, ...args) {
    const hooks = element._vanillapod_hooks;

    if (hooks) {
        if (hookName && hooks[hookName]) {
            (debug() && console.log(`Triggering hook ${hookName} for ${element}`));
            hooks[hookName](args);
        }
        return;
    }

    (debug() && console.log(`No hooks registered for ${element}`));
}

export { triggerHook, registerHooks, registerHook };
