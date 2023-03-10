import { createMemo } from './memo.js';
import { createError } from './error.js';
import { checkType } from './utils.js';

const log = (...output) => console.log(...output);

const eventHandlers = new Set();

export function createElement(element, ...params) {
    const template = document.createElement('template');
    if (typeof element === 'string') {
        element = document.createElement(element);
    }
    if (params.length > 0) {
        for (const param of params) {
            if (typeof param === 'string') {
                const text = document.createTextNode(param);
                element.append(text);
            }
            if (typeof param === 'object' && !(param instanceof Node)) {
                const props = param;
                const indexOfStart = 0;
                const eventKey = 'on';
                for (const [key, value] of Object.entries(props)) {
                    console.log({ key, value });
                    // if (key in element) {
                    element[key] = value;
                    // }
                    if (key.indexOf(eventKey) === indexOfStart) {
                        const sliceStart = eventKey.length;
                        const normalizedEvent = key
                            .slice(sliceStart)
                            .toLowerCase();
                        eventHandlers.add({
                            element,
                            event: [normalizedEvent, value],
                        });
                        // continue;
                        console.log({
                            normalizedEvent,
                            indexOfStart,
                            sliceStart,
                        });
                    }
                }
            }
            // log('bottom', { param });
            if (param instanceof Node) {
                try {
                    element.append(param);
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }
    template.content.append(element);
    // return template.content.cloneNode(true);
    return template.content; // this makes the event handling work since we do not loose the referense to the element.
}

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
        elements.clear();
        log('cleanupElements', elements);
    }
    createError(`dom: can't cleanup elements Set: ${elements.size > 0}`);
}

for (const el of elements) {
    dom.set(el, (...params) => {
        const memo = createMemo((...params) => createElement(el, ...params));
        return memo(...params);
        // return createElement(el, ...params);
    });
}

cleanupElements();

console.log({ dom });

console.log(dom.get('div')('Hello There'));

function createRoot(root = null) {
    if (root instanceof Node) {
        for (const { element, event } of eventHandlers) {
            const [name, fn] = event;
            console.log(element, event);
            root.addEventListener(name, (e) => {
                console.log({ e, target: e.target, element });
                if (e.target === element) {
                    console.log('match!');
                    fn(e);
                }
            });
        }
    }
    createError('dom: Expected root to be an instance of NodePrototype');
}

export function render(root, ...mountables) {
    if (typeof root === 'function') {
        root = root();
    }
    const loop = (done = null) => {
        const results = [];
        for (let mountable of mountables) {
            if (checkType(mountable) === 'function') {
                results.push(mountable());
                continue;
                // results.push(component);
            }
            if (checkType(mountable) === 'array') {
                const [component, props] = mountable;
                results.push(component(props));
                continue;
            }
            results.push(mountable);
        }
        // console.log([...mountables]);
        if (done && typeof done === 'function') done(...results);
    };
    loop((...results) => {
        root.append(...results);
        createRoot(root);
    });
}

function el(el) {
    return (...params) => dom.get(el)(...params);
}

export const div = el('div');
export const p = el('p');
export const h1 = el('h1');
export const h2 = el('h2');
export const h3 = el('h3');
export const h4 = el('h4');
export const h5 = el('h5');
export const h6 = el('h6');
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
