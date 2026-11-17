/**
 * createMountable
 *
 * Create a function that builds `element` and applies the params passed to it.
 *
 * @overload
 * @param {MountableElement} [element] - what to create the mountable from
 * @param {boolean} [template] - wrap the result in a template's content fragment
 * @returns {Mountable}
 */
export function createMountable(element?: MountableElement | undefined, template?: boolean | undefined): Mountable;
/**
 * render
 *
 * Append mountables to `root` and attach their event handlers.
 *
 * @overload
 * @param {Node[] | (() => Node | Node[])} mountables - nodes to render, or a function returning them
 * @param {(ParentNode & Node) | (() => (ParentNode & Node) | null) | null} root - node to render into, or a function returning it
 * @returns {(position?: number | null) => void} destroy function removing rendered elements
 */
export function render(mountables: Node[] | (() => Node | Node[]), root: (ParentNode & Node) | (() => (ParentNode & Node) | null) | null): (position?: number | null) => void;
export function createTemplate(el: MountableElement, ...params: MountableParam[]): Node;
export const div: Mountable;
export const p: Mountable;
export const h1: Mountable;
export const h2: Mountable;
export const h3: Mountable;
export const h4: Mountable;
export const h5: Mountable;
export const h6: Mountable;
export const hr: Mountable;
export const article: Mountable;
export const aside: Mountable;
export const footer: Mountable;
export const header: Mountable;
export const main: Mountable;
export const nav: Mountable;
export const section: Mountable;
export const ul: Mountable;
export const ol: Mountable;
export const li: Mountable;
export const dl: Mountable;
export const dt: Mountable;
export const dd: Mountable;
export const form: Mountable;
export const fieldset: Mountable;
export const label: Mountable;
export const input: Mountable;
export const textarea: Mountable;
export const button: Mountable;
export const select: Mountable;
export const option: Mountable;
export const span: Mountable;
export const br: Mountable;
/** @type {Mountable} */
export const fragment: Mountable;
export function text(text: string): Text;
export function comment(text: string): Comment;
/**
 * What a mountable is created from: a tag name, a node, a component,
 * a `[component, props]` tuple, element props, or `null` for a fragment.
 */
export type MountableElement = string | Node | Component | [Component, unknown] | ElementProps | null;
/**
 * A parameter passed to a mountable: props to set on the element, text content,
 * a child node to append, or a callback receiving the element.
 */
export type MountableParam = Record<string, unknown> | string | number | Node | ((element: any) => void);
/**
 * A function creating a node from mountable params, e.g. `div("Hello")`.
 */
export type Mountable = (...params: MountableParam[]) => Node;
import type { Component } from "./element.js";
import type { ElementProps } from "./element.js";
