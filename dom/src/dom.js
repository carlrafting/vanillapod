import { checkType } from "./utils.js";
import { normalizeEvent } from "./events.js";

/** @type {Set<PropertyKey>} */
const elPropsBlacklist = new Set(["innerHTML"]);

/**
 * Sets properties from a props object. Keys starting with `on` that hold a
 * function are added to the element as event listeners.
 *
 * @param {any} element
 * @param {Record<string, any>} props
 */
function applyProps(element, props) {
  for (const [key, value] of Object.entries(props)) {
    if (elPropsBlacklist.has(key)) continue;
    if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(normalizeEvent(key), value);
    } else {
      element[key] = value;
    }
  }
}

/**
 * Builds an element from a tag name. Strings and numbers become text, Nodes
 * are appended, and a props object sets properties.
 *
 * @param {string} tagName
 * @param {any[]} params - an optional props object, then children
 * @returns {HTMLElement}
 */
function build(tagName, params) {
  const element = document.createElement(tagName);
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
  "span",
  "br",
  // 4. Image And Multimedia
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
