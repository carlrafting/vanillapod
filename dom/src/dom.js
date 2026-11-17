import { checkType } from "./utils.js";
import { normalizeEvent } from "./events.js";

/**
 * @param {string | HTMLElement} element
 * @param {Record<string, any>} props
 * @returns {any} the props merged with `element` and `el`, or undefined when no element is given
 */
export function buildElement(element, props = {}) {
  if (!element) {
    return;
  }

  if (typeof element === "string") {
    element = document.createElement(element);
  }

  const values = props.props || props.properties;
  if (values) {
    for (const key of Object.keys(values)) {
      /** @type {any} */ (element)[key] = values[key];
    }
  }

  const { classList, classNames, data, attributes, attrs, text } = props;
  const classes = classList || classNames;
  if (classes) {
    for (const className of classes) {
      element.classList.add(className);
    }
  }
  if (data) {
    for (const key in data) {
      if (Object.hasOwn(data, key)) {
        element.dataset[key] = data[key];
      }
    }
  }
  const attributeMap = attrs || attributes;
  if (attributeMap) {
    const attributeValues = typeof attributeMap === "function"
      ? attributeMap()
      : attributeMap;
    for (const key in attributeValues) {
      if (Object.hasOwn(attributeValues, key)) {
        element.setAttribute(key, attributeValues[key]);
      }
    }
  }
  if (text && text !== "") {
    element.textContent = text;
  }

  // `on` takes precedence over `events` when both are given.
  const handlers = props.on || props.events;
  if (handlers) {
    for (const event of Object.keys(handlers)) {
      element.addEventListener(normalizeEvent(event), handlers[event], false);
    }
  }

  return {
    ...props,
    element,
    el: element,
  };
}

/**
 * @type {{ element: any; event: any[]; }[]}
 */
const eventHandlers = [];
/** @type {Set<PropertyKey>} */
const elPropsBlacklist = new Set(["innerHTML"]);

/**
 * @param {any} [element] - tag name, node, component, or props object; null creates a fragment
 * @param {boolean} [template]
 */
/**
 * @param {any} [element] - tag name, node, component, or props object; null creates a fragment
 * @param {boolean} [template]
 * @returns {(...params: any[]) => any}
 */
export function createMountable(
  element = null,
  template = true,
) {
  return function inner(
    /** @type {any[]} */ ...params
  ) {
    const templateEl = template
      ? /** @type {HTMLTemplateElement} */ (document.createElement("template"))
      : null;
    if (!element || element === null) {
      element = document.createDocumentFragment();
    }
    if (element && typeof element === "string") {
      element = document.createElement(element);
    }
    if (typeof element === "function") {
      element = element({}); // NOTE: perhaps we should make sure props stay reactive here?
    }
    if (checkType(element) === "array") {
      const [component, props] = element;
      element = component(props);
    }
    if (checkType(element) === "object") {
      // NOTE: backwards compat
      const config = /** @type {any} */ (element);
      if (config.el || config.element) {
        // skip setting blacklisted props like innerHTML, whichever alias is used
        for (const values of [config.props, config.properties]) {
          if (!values) continue;
          for (const key of Object.keys(values)) {
            if (elPropsBlacklist.has(key)) {
              delete values[key];
            }
          }
        }

        const { el, children } = buildElement(
          config.el || config.element,
          { ...config },
        );
        if (children) {
          el.append(...children);
        }
        element = el;
      }
    }
    if (params && params.length > 0) {
      for (const param of params) {
        if (typeof param === "object" && !(param instanceof Node)) {
          const props = param;
          const indexOfStart = 0;
          const eventKey = "on";
          for (const [key, value] of Object.entries(props)) {
            if (elPropsBlacklist.has(key)) {
              // skip setting blacklisted props like innerHTML
              delete props[key];
              continue;
            }
            const isEvent = key.indexOf(eventKey) === indexOfStart &&
              typeof value === "function";
            // event handlers are delegated from the root; assigning them
            // directly as well would fire them twice
            if (!isEvent) element[key] = value;
            if (isEvent) {
              const sliceStart = eventKey.length;
              const normalizedEvent = key
                .slice(sliceStart)
                .toLowerCase();
              eventHandlers.push({
                element,
                event: [normalizedEvent, value],
              });
            }
          }
        }
        if (typeof param === "string" || typeof param === "number") {
          const text = document.createTextNode(String(param));
          element.textContent = text.data;
        }
        if (param instanceof Node) {
          try {
            element.append(param);
          } catch (err) {
            console.error(err);
          }
        }
        if (typeof param === "function") {
          const elementProxy = new Proxy(element, {
            get(target, prop, receiver) {
              /* if (!elPropsBlacklist.has(prop)) {
                                // return element;
                                return;
                            } */
              const value = target[prop];
              if (typeof value === "function") {
                return /** @this {any} */ function (
                  /** @type {any[]} */ ...args
                ) {
                  return value.apply(
                    this === receiver ? target : this,
                    args,
                  );
                };
              }
              return Reflect.get(target, prop);
            },
            set(target, prop, value) {
              if (!elPropsBlacklist.has(prop)) {
                return Reflect.set(target, prop, value);
              }
              throw new Error(
                `createMountable: It is not allowed to set property '${
                  String(prop)
                }' with callback`,
              );
            },
          });
          param(elementProxy);
        }
      }
    }
    if (template) {
      /** @type {HTMLTemplateElement} */ (templateEl).content.append(element);
      // return template.content.cloneNode(true);
      return /** @type {HTMLTemplateElement} */ (templateEl).content; // NOTE: this makes the event handling work since we do not loose the reference to the element.
    }
    return element;
  };
}

/**
 * @param {any} el
 * @param {...any} params
 * @returns {any}
 */
export const createTemplate = (
  /** @type {any} */ el,
  /** @type {any[]} */ ...params
) => createMountable(el, true)(...params);

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
  // const memo = createMemo((fn, ...params) => fn(...params));
  for (const el of elements) {
    const fn = (/** @type {any[]} */ ...params) => {
      const mountable = createMountable(el, true);
      // return memo(fn, ...params);
      return mountable(...params);
    };
    dom.set(el, fn);
  }
  console.log({ dom });
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
 * @param {...unknown} params
 * @returns {any}
 */
export const fragment = (...params) => createMountable(null, false)(...params);
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
 * @param {{ parentNode: Node; } | null} parentNode
 * @param {HTMLElement} element
 */
function elementIsParentNode(
  parentNode,
  element,
) {
  if (!element && !parentNode) {
    throw new Error(
      `elementIsParentNode requires 2 arguments, ${elementIsParentNode.length} was provided`,
    );
  }

  if (parentNode === element) {
    return true;
  }

  if (parentNode === null) {
    return false;
  }
  return elementIsParentNode(parentNode, element);
}

function createRoot(
  /** @type {HTMLElement|null} */ root = null,
) {
  if (!root) {
    throw "root must be provided in order to render elements";
  }
  if (root instanceof Node) {
    // return console.log({ eventHandlers });
    for (const { element, event } of eventHandlers) {
      // console.log({ element, event });
      if (!element && !event) return;
      const [name, fn] = event;
      // log(element, event);
      root.addEventListener(
        name,
        (e) => {
          // log({ e, target: e.target, element });
          if (
            e.target === element ||
            elementIsParentNode(e.target.parentNode, element)
          ) {
            // log('match!');
            fn(e);
          }
        },
        {
          capture: true,
        },
      );
    }
    return (eventHandlers.length = 0);
  }
  throw new Error("dom: Expected root to be an instance of Node");
}

/**
 * @param {any[] | (() => any)} mountables
 * @param {HTMLElement | (() => HTMLElement | null | undefined) | null | undefined} root
 * @returns {() => void} destroy function
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
  // narrowing does not carry into the closures below, so keep a non-null copy
  const target = /** @type {HTMLElement} */ (root);
  if (typeof mountables === "function") {
    mountables = mountables();
    if (checkType(mountables) !== "array") {
      mountables = [mountables];
    }
  }
  /**
   * @type {any[]}
   */
  const results = [];
  /** @type {(done?: (() => void) | null) => void} */
  const loop = (done = null) => {
    for (const mountable of /** @type {any[]} */ (mountables)) {
      if (mountable || mountable !== null) {
        results.push(mountable);
      }
    }
    if (done && typeof done === "function") done();
  };
  loop(function done() {
    target.append(...results);
    results.length = 0; // clear results array since all items are mounted and we no longer have any use for it
    // console.log({ root });
    createRoot(target);
  });
  return function destroy(position = null) {
    if (position !== null && typeof position !== "number") {
      throw new Error("destroy: expected position to be of value Number");
    }
    const rootChildren = root.querySelectorAll("*");
    if (position === null) {
      // console.log({ root });
      for (const child of rootChildren) {
        child.remove();
      }
      return;
    }
    if (rootChildren.length > 0) {
      for (let i = 0; i < rootChildren.length; i++) {
        if (i === position) {
          const mountable = rootChildren[i];
          mountable.remove();
        }
      }
    }
  };
}
