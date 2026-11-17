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
export default function mount(root: Node | null | undefined, ...args: unknown[]): undefined;
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
export function init(arg: unknown, vanillapodComponent: Component | undefined, props: unknown): [Component | undefined, unknown];
import type { Component } from "./element.js";
