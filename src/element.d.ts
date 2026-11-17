/**
 * validateProps
 *
 * @param {object} props - props to validate against `validProps`
 * @returns {true | undefined} `true` when every key is valid
 */
export function validateProps(props: object): true | undefined;
/**
 * createComponentInstance
 *
 * @param {Component} vanillapodComponent - component function
 * @param {unknown} [vanillapodComponentProps] - props to pass to the component
 * @returns {(ElementProps & { vanillapodComponent: Component }) | undefined}
 */
export function createComponentInstance(vanillapodComponent: Component, vanillapodComponentProps?: unknown): (ElementProps & {
    vanillapodComponent: Component;
}) | undefined;
/**
 * createElement
 *
 * @param {string | HTMLElement} element - tag name or element
 * @param {...(ElementProps | any[] | (() => ElementProps))} args - props, an array of children, or a function returning props
 * @returns {CreatedElement | undefined}
 */
export function createElement(element: string | HTMLElement, ...args: (ElementProps | any[] | (() => ElementProps))[]): CreatedElement | undefined;
/**
 * Attributes to set on an element, either as an object or a function returning one.
 *
 * A function is called and its result is applied as element props.
 *
 * @typedef {Record<string, string> | (() => ElementProps)} ElementAttributes
 */
/**
 * Hooks that can be registered for an element, e.g. `before` and `mount`.
 *
 * @typedef {Record<string, (...args: any[]) => void>} ElementHooks
 */
/**
 * Props describing an element for `createElement` and `mount`.
 *
 * @typedef {object} ElementProps
 * @property {string | Node | null} [element] - tag name or node
 * @property {string | Node | null} [el] - alias for `element`
 * @property {Record<string, unknown>} [data] - `data-*` attributes
 * @property {string[]} [classList] - class names to add
 * @property {string[]} [classNames] - alias for `classList`
 * @property {ElementAttributes} [attributes] - attributes to set
 * @property {ElementAttributes} [attrs] - alias for `attributes`
 * @property {Record<string, unknown>} [properties] - DOM properties to set
 * @property {Record<string, unknown>} [props] - alias for `properties`
 * @property {any[]} [children] - child components to mount
 * @property {string | number | null} [text] - text content
 * @property {Record<string, EventListenerOrEventListenerObject>} [events] - event handlers keyed by event name
 * @property {Record<string, EventListenerOrEventListenerObject>} [on] - alias for `events`
 * @property {ElementHooks} [hooks] - lifecycle hooks
 */
/**
 * A component: a function returning element props.
 *
 * @typedef {(props?: any) => ElementProps} Component
 */
/**
 * The result of `createElement`: the props it was given plus the created element.
 *
 * @typedef {ElementProps & { element: HTMLElement, el: HTMLElement }} CreatedElement
 */
/**
 * The keys accepted in `ElementProps`, with their default values.
 *
 * @type {Required<ElementProps>}
 */
export const validProps: Required<ElementProps>;
/**
 * createElement
 *
 * @param {string | HTMLElement} element - tag name or element
 * @param {...(ElementProps | any[] | (() => ElementProps))} args - props, an array of children, or a function returning props
 * @returns {CreatedElement | undefined}
 */
export function h(element: string | HTMLElement, ...args: (ElementProps | any[] | (() => ElementProps))[]): CreatedElement | undefined;
/**
 * createElement
 *
 * @param {string | HTMLElement} element - tag name or element
 * @param {...(ElementProps | any[] | (() => ElementProps))} args - props, an array of children, or a function returning props
 * @returns {CreatedElement | undefined}
 */
export function e(element: string | HTMLElement, ...args: (ElementProps | any[] | (() => ElementProps))[]): CreatedElement | undefined;
/**
 * createElement
 *
 * @param {string | HTMLElement} element - tag name or element
 * @param {...(ElementProps | any[] | (() => ElementProps))} args - props, an array of children, or a function returning props
 * @returns {CreatedElement | undefined}
 */
export function html(element: string | HTMLElement, ...args: (ElementProps | any[] | (() => ElementProps))[]): CreatedElement | undefined;
/**
 * Attributes to set on an element, either as an object or a function returning one.
 *
 * A function is called and its result is applied as element props.
 */
export type ElementAttributes = Record<string, string> | (() => ElementProps);
/**
 * Hooks that can be registered for an element, e.g. `before` and `mount`.
 */
export type ElementHooks = Record<string, (...args: any[]) => void>;
/**
 * Props describing an element for `createElement` and `mount`.
 */
export type ElementProps = {
    /**
     * - tag name or node
     */
    element?: string | Node | null | undefined;
    /**
     * - alias for `element`
     */
    el?: string | Node | null | undefined;
    /**
     * - `data-*` attributes
     */
    data?: Record<string, unknown> | undefined;
    /**
     * - class names to add
     */
    classList?: string[] | undefined;
    /**
     * - alias for `classList`
     */
    classNames?: string[] | undefined;
    /**
     * - attributes to set
     */
    attributes?: ElementAttributes | undefined;
    /**
     * - alias for `attributes`
     */
    attrs?: ElementAttributes | undefined;
    /**
     * - DOM properties to set
     */
    properties?: Record<string, unknown> | undefined;
    /**
     * - alias for `properties`
     */
    props?: Record<string, unknown> | undefined;
    /**
     * - child components to mount
     */
    children?: any[] | undefined;
    /**
     * - text content
     */
    text?: string | number | null | undefined;
    /**
     * - event handlers keyed by event name
     */
    events?: Record<string, EventListenerOrEventListenerObject> | undefined;
    /**
     * - alias for `events`
     */
    on?: Record<string, EventListenerOrEventListenerObject> | undefined;
    /**
     * - lifecycle hooks
     */
    hooks?: ElementHooks | undefined;
};
/**
 * A component: a function returning element props.
 */
export type Component = (props?: any) => ElementProps;
/**
 * The result of `createElement`: the props it was given plus the created element.
 */
export type CreatedElement = ElementProps & {
    element: HTMLElement;
    el: HTMLElement;
};
