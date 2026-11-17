// @ts-self-types="./hooks.d.ts"
import debug from "./debug.js";
import { createError } from "./error.js";

/** @import { ElementHooks } from "./element.js" */

/**
 * An object that can carry registered hooks.
 *
 * @typedef {object & { _vanillapod_hooks?: ElementHooks }} HookTarget
 */

// const defaultHooks = {};

// element property to store hooks
const key = "_vanillapod_hooks";

/**
 * registerHooks
 *
 * @param {HookTarget} element - element to register hooks on
 * @param {{ hooks?: ElementHooks }} props - uses `hooks`
 * @returns {void}
 */
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

/**
 * registerHook
 *
 * @param {HookTarget} element - element with registered hooks
 * @param {string} hook - hook name
 * @returns {void}
 */
function registerHook(element, hook) {
  const hooks = /** @type {Record<string, unknown>} */ (element[key]);

  if (!hooks[hook]) {
    hooks[hook] = hook;
  }
}

/**
 * triggerHook
 *
 * @param {HookTarget} element - element with registered hooks
 * @param {string} hookName - name of hook to trigger
 * @param {...unknown} args - arguments passed to the hook
 * @returns {void}
 */
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

export { registerHook, registerHooks, triggerHook };
