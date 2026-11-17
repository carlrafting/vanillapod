// @ts-self-types="./element.d.ts"
import { createError } from "./error.js";
import debug from "./debug.js";
import setElementProperties from "./properties.js";
import setElementAttributes from "./attributes.js";
import setElementTextContent from "./text.js";
import setElementEventHandlers from "./events.js";

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

export const validProps = {
  element: null,
  el: null,
  data: {},
  classList: [],
  classNames: [],
  attributes: {},
  attrs: {},
  properties: {},
  props: {},
  children: [],
  text: null,
  events: {},
  on: {},
  hooks: {},
};

/**
 * validateProps
 *
 * @param {object} props - props to validate against `validProps`
 * @returns {true | undefined} `true` when every key is valid
 */
export function validateProps(props) {
  for (const key in props) {
    if (!Object.hasOwn(validProps, key)) {
      return createError(
        `${key} is not a valid property name. Try one of the following instead: ${
          Object.keys(
            validProps,
          )
        }`,
      );
    }
  }

  return true;
}

/**
 * createComponentInstance
 *
 * @param {Component} vanillapodComponent - component function
 * @param {unknown} [vanillapodComponentProps] - props to pass to the component
 * @returns {(ElementProps & { vanillapodComponent: Component }) | undefined}
 */
export function createComponentInstance(
  vanillapodComponent,
  vanillapodComponentProps,
) {
  if (typeof vanillapodComponent === "function") {
    debug() && console.log(`Registering ${vanillapodComponent}...`);

    const props = vanillapodComponentProps
      ? vanillapodComponent(vanillapodComponentProps)
      : vanillapodComponent();

    if (typeof props !== "object" || props === undefined) {
      return createError(`${vanillapodComponent} must return an object`);
    }

    if (validateProps(props)) {
      return {
        vanillapodComponent,
        ...props,
      };
    }
  }

  return createError(`${vanillapodComponent} is not a function`);
}

/**
 * createElement
 *
 * @param {string | HTMLElement} element - tag name or element
 * @param {...(ElementProps | any[] | (() => ElementProps))} args - props, an array of children, or a function returning props
 * @returns {CreatedElement | undefined}
 */
export function createElement(element, ...args /* props = {} */) {
  /** @type {ElementProps} */
  let props = {};

  for (const arg of args) {
    if (Array.isArray(arg)) {
      props.children = arg;
      break;
    }
    if (typeof arg === "function") {
      props = /** @type {ElementProps} */ (typeof arg() === "object" && arg());
      break;
    }
    props = arg;
  }

  // console.log(props);

  if (!element) {
    return createError(`element is ${element}`);
  }

  if (typeof element === "string") {
    // (debug() && console.log(`Creating ${element} for ${props.vanillapodComponent}`));
    debug() && console.log("Creating element...");
    element = document.createElement(element);
    debug() && console.log("Created element: ", element);
  }

  // set element properties
  setElementProperties(element, props);

  // set attributes on elements
  setElementAttributes(element, props);

  // set textContent for element
  setElementTextContent(element, props);

  // register DOM event handlers
  setElementEventHandlers(element, props);

  debug() &&
    console.log(
      "createElement: props",
      props,
      "createElement: element",
      element,
    );

  return {
    ...props,
    element,
    el: element,
  };
}

// aliases for createElement
export const h = createElement;
export const e = createElement;
export const html = createElement;
