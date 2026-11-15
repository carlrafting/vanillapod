// const defaultHooks = {};

// element property to store hooks
const key = "_vanillapod_hooks";

/**
 * @param {{ [x: string]: {}; }} element
 */
function registerHooks(element, { hooks = {} }) {
  if (!hooks) {
    return;
  }

  if (!element[key]) {
    element[key] = hooks;
  }
}

function registerHook(element, hook) {
  const hooks = element[key];

  if (!hooks[hook]) {
    hooks[hook] = hook;
  }
}

function triggerHook(element, hookName, ...args) {
  const hooks = element[key];

  if (hooks && hookName && hooks[hookName]) {
    hooks[hookName](...args);
  }
}

export { registerHook, registerHooks, triggerHook };
