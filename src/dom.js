import { createMemo } from './state.js';
import { createError } from './error.js';
import { checkType, createArray } from './utils.js';
import { h, validateProps } from './element.js';

const log = (...output) => console.log(...output);

console.time('dom/internal');

const eventHandlers = [];
const elPropsBlacklist = new Set(['innerHTML']);

// function merge() {}

export function createMountable(element = null, template = true) {
    return function inner(...params) {
        const templateEl = template ? document.createElement('template') : null;
        if (!element || element === null) {
            element = document.createDocumentFragment();
        }
        if (element && typeof element === 'string') {
            element = document.createElement(element);
        }
        if (typeof element === 'function') {
            element = element({}); // NOTE: perhaps we should make sure props stay reactive here?
        }
        if (checkType(element) === 'array') {
            const [component, props] = element;
            element = component(props);
        }
        if (checkType(element) === 'object') {
            // NOTE: backwards compat
            if (validateProps(element)) {
                for (const key of Object.keys(element.props)) {
                    if (elPropsBlacklist.has(key)) {
                        console.log('found it!');
                        // skip setting blacklisted props like innerHTML
                        delete element.props[key];
                    }
                }

                const { el, children } = h(element.el || element.element, {
                    ...element,
                });
                if (children) {
                    el.append(...children);
                }
                element = el;
            }
        }
        if (params && params.length > 0) {
            for (const param of params) {
                if (typeof param === 'object' && !(param instanceof Node)) {
                    const props = param;
                    const indexOfStart = 0;
                    const eventKey = 'on';
                    for (const [key, value] of Object.entries(props)) {
                        if (elPropsBlacklist.has(key)) {
                            // skip setting blacklisted props like innerHTML
                            delete props[key];
                            continue;
                        }
                        element[key] = value;
                        if (key.indexOf(eventKey) === indexOfStart) {
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
                if (typeof param === 'string' || typeof param === 'number') {
                    const text = document.createTextNode(param);
                    element.textContent = text.data;
                }
                if (param instanceof Node) {
                    try {
                        element.append(param);
                    } catch (err) {
                        console.error(err);
                    }
                }
                if (typeof param === 'function') {
                    const elementProxy = new Proxy(element, {
                        get(target, prop, receiver) {
                            /* if (!elPropsBlacklist.has(prop)) {
                                // return element;
                                return;
                            } */
                            const value = target[prop];
                            if (typeof value === 'function') {
                                return function (...args) {
                                    return value.apply(
                                        this === receiver ? target : this,
                                        args
                                    );
                                };
                            }
                            return Reflect.get(target, prop);
                            return Reflect.get(
                                ...arguments
                            ) /* .bind(element) */;
                        },
                        set(target, prop, value) {
                            if (!elPropsBlacklist.has(prop)) {
                                return Reflect.set(target, prop, value);
                            }
                            createError(
                                `createMountable: It is not allowed to set property '${prop}' with callback`
                            );
                        },
                    });
                    param(elementProxy);
                }
            }
        }
        if (template) {
            templateEl.content.append(element);
            // return template.content.cloneNode(true);
            return templateEl.content; // NOTE: this makes the event handling work since we do not loose the reference to the element.
        }
        return element;
    };
}

export const createTemplate = (el, ...params) =>
    createMountable(el, true)(...params);

const dom = new Map();

/**
 * elements
 * @url https://developer.mozilla.org/en-US/docs/Web/HTML/Element#interactive_elements
 */
const elements = new Set([
    // 1. Content Sectioning
    'address',
    'article',
    'aside',
    'footer',
    'header',
    'main',
    'nav',
    'section',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    // 2. Text Content
    'div',
    'p',
    'blockquote',
    'ul',
    'ol',
    'li',
    'dl',
    'dt',
    'dd',
    'figure',
    'figcaption',
    'hr',
    'menu',
    'pre',
    // 3. Inline Text Semantics
    'span',
    'br',
    // 4. Image And Multimedia
    // 5. Embedded content
    // 6. SVG
    // 7. Demarcating Edits
    // 8. Table Content
    // 9. Forms
    'form',
    'fieldset',
    'label',
    'input',
    'textarea',
    'button',
    'select',
    'option',
    // 10. Interactive Elements
    // 11. Web Components
]);

function cleanupElements() {
    if (dom.size > 0) {
        for (const el of elements) {
            elements.delete(el);
        }
        return elements.clear();
    }
    createError(
        `cleanupElements: can't cleanup elements Set: ${elements.size > 0}`
    );
}

function createDOMMap(done = null) {
    // const memo = createMemo((fn, ...params) => fn(...params));
    for (const el of elements) {
        const fn = (...params) => {
            const createElement = createMountable(el, true);
            // return memo(fn, ...params);
            return createElement(...params);
        };
        dom.set(el, fn);
    }
    console.log({ dom });
    if (done && typeof done === 'function') {
        done();
    }
}

createDOMMap(() => cleanupElements());

const el =
    (el) =>
    (...params) =>
        dom.get(el)(...params);

export const div = el('div');
export const p = el('p');
export const h1 = el('h1');
export const h2 = el('h2');
export const h3 = el('h3');
export const h4 = el('h4');
export const h5 = el('h5');
export const h6 = el('h6');
export const hr = el('hr');
export const article = el('article');
export const aside = el('aside');
export const footer = el('footer');
export const header = el('header');
export const main = el('main');
export const nav = el('nav');
export const section = el('section');
export const ul = el('ul');
export const ol = el('ol');
export const li = el('li');
export const dl = el('dl');
export const dt = el('dt');
export const dd = el('dd');
export const form = el('form');
export const fieldset = el('fieldset');
export const label = el('label');
export const input = el('input');
export const textarea = el('textarea');
export const button = el('button');
export const select = el('select');
export const option = el('option');
export const span = el('span');
export const br = el('br');

export const fragment = (...params) => createMountable(null, false)(...params);
export const text = (text) => document.createTextNode(text);
export const comment = (text) => document.createComment(text);
// log({ dom });

// log(dom.get('div')('Hello There'));

function elementIsParentNode(parentNode = null, element = null) {
    if (!element && !parentNode) {
        return createError(
            'dom: elementIsParentNode requires 2 arguments, was',
            elementIsParentNode.length
        );
    }

    if (parentNode === element) {
        return true;
    }

    if (parentNode === null) {
        return false;
    }
    return elementIsParentNode(parentNode.parentNode, element);
}

function createRoot(root = null) {
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
                }
            );
        }
        return (eventHandlers.length = 0);
    }
    createError('dom: Expected root to be an instance of NodePrototype');
}

export function render(mountables, root) {
    if (typeof root === 'function') {
        root = root();
    }
    if (!root) {
        throw new Error(
            'render: root element could not be found in this document!'
        );
    }
    if (typeof mountables === 'function') {
        mountables = mountables();
        if (checkType(mountables) !== 'array') {
            mountables = [mountables];
        }
    }
    const results = [];
    const loop = (done = null) => {
        for (const mountable of mountables) {
            /* if (checkType(mountable) === 'function') {
                results.push(mountable());
                continue;
                // results.push(component);
            }
            if (checkType(mountable) === 'array') {
                const [component, props] = mountable;
                results.push(component(props));
                continue;
            } */
            if (mountable || mountable !== null) {
                results.push(mountable);
            }
        }
        // console.log([...mountables]);
        if (done && typeof done === 'function') done();
    };
    loop(function done() {
        root.append(...results);
        results.length = 0; // clear results array since all items are mounted and we no longer have any use for it
        // console.log({ root });
        createRoot(root);
    });
    return function destroy(position = null) {
        if (typeof position !== 'number')
            createError('destroy: expected position to be of value Number');
        const rootChildren = root.querySelectorAll('*');
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

console.timeEnd('dom/internal');
