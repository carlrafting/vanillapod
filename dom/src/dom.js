import { checkType } from "./utils.js";
import { normalizeEvent } from "./events.js";

/** @type {Set<PropertyKey>} */
const elPropsBlacklist = new Set(["innerHTML"]);

/**
 * @param {any} handler
 * @returns {boolean} whether it can be passed to `addEventListener`
 */
function isListener(handler) {
  return typeof handler === "function" ||
    (!!handler && typeof handler.handleEvent === "function");
}

/**
 * Adds an event listener. The handler is a function, an object with a
 * `handleEvent` method, or a `[handler, options]` pair where options are
 * passed to `addEventListener` (`once`, `capture`, `passive`, `signal`).
 *
 * @param {any} element
 * @param {string} type
 * @param {any} handler
 */
function listen(element, type, handler) {
  if (isListener(handler)) {
    element.addEventListener(type, handler);
  } else if (Array.isArray(handler) && isListener(handler[0])) {
    element.addEventListener(type, handler[0], handler[1]);
  }
}

/**
 * Sets properties from a props object.
 *
 * - `on<event>` adds a listener for the lowercased event name. The value is a
 *   function, an object with `handleEvent`, or `[handler, options]` to pass
 *   listener options.
 * - `on` takes an object of `{ [eventName]: handler }` and uses the event
 *   names as written, so custom events like `"my-event"` work.
 * - `dataset` is merged into the element's dataset.
 * - `class` sets the class attribute, and keys with a dash (`aria-*`,
 *   `data-*`) are set as attributes.
 * - Everything else is assigned as a property.
 *
 * @param {any} element
 * @param {Record<string, any>} props
 */
function applyProps(element, props) {
  for (const [key, value] of Object.entries(props)) {
    if (elPropsBlacklist.has(key)) continue;
    if (key === "on" && value && typeof value === "object") {
      for (const [type, handler] of Object.entries(value)) {
        listen(element, type, handler);
      }
    } else if (
      key.startsWith("on") && (isListener(value) || Array.isArray(value))
    ) {
      listen(element, normalizeEvent(key), value);
    } else if (key === "dataset" && value && typeof value === "object") {
      Object.assign(element.dataset, value);
    } else if (key === "class") {
      element.setAttribute("class", value);
    } else if (key.includes("-")) {
      element.setAttribute(key, value);
    } else {
      element[key] = value;
    }
  }
}

/**
 * Applies params to an element: strings and numbers are appended as text,
 * Nodes are appended, and a props object sets properties.
 *
 * @template {Element} T
 * @param {T} element
 * @param {any[]} params - an optional props object, then children
 * @returns {T}
 */
function apply(element, params) {
  for (const param of params) {
    if (typeof param === "string" || typeof param === "number") {
      element.append(document.createTextNode(String(param)));
    } else if (param instanceof Node) {
      element.append(param);
    } else if (param && typeof param === "object") {
      applyProps(element, param);
    }
  }
  return element;
}

/**
 * Builds an element from a tag name.
 *
 * @param {string} tagName
 * @param {any[]} params - an optional props object, then children
 * @returns {HTMLElement}
 */
function build(tagName, params) {
  return apply(document.createElement(tagName), params);
}

/**
 * Applies props, event handlers and children to elements that already exist,
 * using the same params as the element helpers. Children are appended.
 *
 * Pass one element to get it back, or a list of elements (an array, a
 * `NodeList` or any other iterable) to apply the same params to each and get
 * an array back. With a list, the same listeners are added to every element
 * (use `event.currentTarget` to tell them apart), and children must be
 * strings or numbers: a DOM node can only be in one place.
 *
 * @template {Element} T
 * @overload
 * @param {T} element
 * @param {...any} params - an optional props object, then children
 * @returns {T} the same element
 */
/**
 * @template {Element} T
 * @overload
 * @param {Iterable<T>} elements
 * @param {...any} params - an optional props object, then children
 * @returns {T[]} the same elements, as an array
 */
/**
 * @param {any} target
 * @param {...any} params
 * @returns {any}
 */
export function enhance(target, ...params) {
  if (target instanceof Element) return apply(target, params);
  if (
    target === null || typeof target !== "object" ||
    typeof target[Symbol.iterator] !== "function"
  ) {
    throw new TypeError(
      "enhance: first argument must be an Element or a list of Elements",
    );
  }
  const elements = [...target];
  elements.forEach((element, index) => {
    if (!(element instanceof Element)) {
      throw new TypeError(
        `enhance: item ${index} in the list is not an Element`,
      );
    }
  });
  if (params.some((param) => param instanceof Node)) {
    throw new TypeError(
      "enhance: a node child can't be added to a list of elements, " +
        "because a node can only be in one place. " +
        "Create the node for each element in a loop instead.",
    );
  }
  return elements.map((element) => apply(element, params));
}

const selectorPattern = /^([a-zA-Z][\w-]*)?((?:[#.][\w-]+)*)$/;

/**
 * Creates an element from a CSS-like selector: a tag name (default `div`),
 * an optional `#id` and any number of `.class` names, e.g. `div.card#main`.
 * The remaining params work like the element helpers: an optional props
 * object, then children. Unlike the helpers it can create any tag, including
 * custom elements.
 *
 * A props `id` overrides the selector's id, and a props `class` or
 * `className` is kept alongside the selector's classes.
 *
 * @param {string} selector
 * @param {...any} params - an optional props object, then children
 * @returns {HTMLElement}
 */
export function h(selector, ...params) {
  const match = typeof selector === "string" && selector !== "" &&
    selectorPattern.exec(selector);
  if (!match) {
    throw new TypeError(
      `h: invalid selector ${JSON.stringify(selector)}, expected tag#id.class`,
    );
  }
  const [, tag = "div", rest] = match;
  const element = document.createElement(tag);
  /** @type {string[]} */
  const classes = [];
  for (const [, type, name] of rest.matchAll(/([#.])([\w-]+)/g)) {
    if (type === "#") element.id = name;
    else classes.push(name);
  }
  apply(element, params);
  element.classList.add(...classes);
  return element;
}

const dom = new Map();

/**
 * elements
 * @url https://developer.mozilla.org/en-US/docs/Web/HTML/Element#interactive_elements
 */
const elements = new Set([
  // 1. Content Sectioning
  "address",
  "article",
  "aside",
  "footer",
  "header",
  "main",
  "nav",
  "section",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  // 2. Text Content
  "div",
  "p",
  "blockquote",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "figure",
  "figcaption",
  "hr",
  "menu",
  "pre",
  // 3. Inline Text Semantics
  "a",
  "code",
  "em",
  "small",
  "span",
  "strong",
  "br",
  // 4. Image And Multimedia
  "img",
  // 5. Embedded content
  // 6. SVG
  // 7. Demarcating Edits
  // 8. Table Content
  // 9. Forms
  "form",
  "fieldset",
  "label",
  "input",
  "textarea",
  "button",
  "select",
  "option",
  // 10. Interactive Elements
  // 11. Web Components
]);

function cleanupElements() {
  if (dom.size === 0) {
    throw new Error(
      `cleanupElements: can't cleanup elements Set: ${elements.size}`,
    );
  }
  if (dom.size > 0) {
    for (const el of elements) {
      elements.delete(el);
    }
    return elements.clear();
  }
}

/**
 * @param {(() => void) | null} [done]
 */
function createDOMMap(done = null) {
  for (const el of elements) {
    const fn = (/** @type {any[]} */ ...params) => build(el, params);
    dom.set(el, fn);
  }
  if (done && typeof done === "function") {
    done();
  }
}

createDOMMap(() => cleanupElements());

/**
 * @param {string} el
 * @returns {(...params: any[]) => any}
 */
const el = (el) => (/** @type {any} */ ...params) => dom.get(el)(...params);

export const div = el("div");
export const p = el("p");
export const h1 = el("h1");
export const h2 = el("h2");
export const h3 = el("h3");
export const h4 = el("h4");
export const h5 = el("h5");
export const h6 = el("h6");
export const hr = el("hr");
export const address = el("address");
export const blockquote = el("blockquote");
export const figure = el("figure");
export const figcaption = el("figcaption");
export const menu = el("menu");
export const pre = el("pre");
export const a = el("a");
export const code = el("code");
export const em = el("em");
export const small = el("small");
export const strong = el("strong");
export const img = el("img");
export const article = el("article");
export const aside = el("aside");
export const footer = el("footer");
export const header = el("header");
export const main = el("main");
export const nav = el("nav");
export const section = el("section");
export const ul = el("ul");
export const ol = el("ol");
export const li = el("li");
export const dl = el("dl");
export const dt = el("dt");
export const dd = el("dd");
export const form = el("form");
export const fieldset = el("fieldset");
export const label = el("label");
export const input = el("input");
export const textarea = el("textarea");
export const button = el("button");
export const select = el("select");
export const option = el("option");
export const span = el("span");
export const br = el("br");

/**
 * @param {string} text
 * @returns {Text}
 */
export const text = (text) => document.createTextNode(text);
/**
 * @param {string} text
 * @returns {Comment}
 */
export const comment = (text) => document.createComment(text);

/**
 * @param {any[] | (() => any)} mountables
 * @param {HTMLElement | (() => HTMLElement | null | undefined) | null | undefined} root
 */
export function render(
  mountables,
  root,
) {
  if (typeof root === "function") {
    root = root();
  }
  if (!root) {
    throw new Error(
      "render: root element could not be found in this document!",
    );
  }
  if (typeof mountables === "function") {
    mountables = mountables();
    if (checkType(mountables) !== "array") {
      mountables = [mountables];
    }
  }
  const results = /** @type {any[]} */ (mountables).filter((mountable) =>
    mountable !== null && mountable !== undefined &&
    typeof mountable !== "boolean"
  );
  root.append(...results);
}
