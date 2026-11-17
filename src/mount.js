// @ts-self-types="./mount.d.ts"
import { registerHooks, triggerHook } from "./hooks.js";
import { createError } from "./error.js";
import { checkType } from "./utils.js";
import { createComponentInstance, createElement } from "./element.js";

/** @import { Component, CreatedElement, ElementProps } from "./element.js" */
/** @import { HookTarget } from "./hooks.js" */

/**
 * mount
 *
 * Mount components to `root`, or to `document.body` when `root` is falsy.
 *
 * @param {Node | null | undefined} root - node to mount to
 * @param {...unknown} args - components, `[component, props]` tuples, props objects or nodes
 * @returns {undefined}
 */
export default function mount(root, ...args) {
  let index = 0;
  /** @type {Component | undefined} */
  let vanillapodComponent;
  /** @type {unknown} */
  let props = {};
  const argsLength = args.length;

  for (; index < argsLength; index += 1) {
    const arg = args[index];

    [vanillapodComponent, props] = init(arg, vanillapodComponent, props);

    if (!vanillapodComponent) {
      return createError("Could not determine component format");
    }

    const instance = createComponentInstance(vanillapodComponent, props);

    // console.log({ instance });

    if (!instance) {
      return createError(
        `Could not create instance for ${vanillapodComponent}`,
      );
    }

    /** @type {any} */
    let { el, element } = instance;

    if (!el) {
      el = element;
      element = null;
      // delete instance.element;
    }

    // if el is a string, use implicit render approach
    if (checkType(el) === "string") {
      const props = /** @type {CreatedElement} */ (
        createElement(el, instance)
      );
      el = props.el || props.element;
    }

    registerHooks(el, instance);

    const hooks = /** @type {HookTarget} */ (el)._vanillapod_hooks;

    // trigger element before hook
    if (hooks && hooks.before) {
      triggerHook(el, "before");
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
      triggerHook(el, "mount");
    }
  }
}

/**
 * init
 *
 * Normalize a mount argument into a component and its props.
 *
 * @param {unknown} arg - component, `[component, props]` tuple, props object or node
 * @param {Component | undefined} vanillapodComponent - current component
 * @param {unknown} props - current props
 * @returns {[Component | undefined, unknown]}
 */
export function init(arg, vanillapodComponent, props) {
  // console.log({arg, vanillapodComponent, props});
  checkType(arg) === "array" &&
    ([vanillapodComponent, props] = /** @type {[Component, unknown]} */ (arg));
  checkType(arg) === "function" &&
    (vanillapodComponent = /** @type {Component} */ (arg));
  checkType(arg) === "asyncfunction" &&
    (vanillapodComponent = /** @type {Component} */ (arg));
  checkType(arg) === "object" &&
    (vanillapodComponent = () => /** @type {ElementProps} */ (arg));
  arg instanceof Node && (vanillapodComponent = () => ({ el: arg }));
  return [vanillapodComponent, props];
}
