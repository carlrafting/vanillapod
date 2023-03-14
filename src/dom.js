import { createMemo } from './memo.js';
import { createError } from './error.js';
import { checkType } from './utils.js';

const log = (...output) => console.log(...output);

console.time('dom/internal');

const eventHandlers = new Set();

// function merge() {}

export function createMountable(element, ...params) {
    const template = document.createElement('template');
    if (typeof element === 'string') {
        element = document.createElement(element);
    }
    if (!element || element === null) {
        element = document.createDocumentFragment();
    }
    if (params.length > 0) {
        let prevProps = null;
        for (const param of params) {
            if (checkType(param) === 'array') {
                const [component, props] = param;
                console.log({ component });
                element.append(component(props));
            }
            if (typeof param === 'function') {
                element.append(param());
            }
            if (typeof param === 'string') {
                const text = document.createTextNode(param);
                element.append(text);
            }
            if (typeof param === 'object' && !(param instanceof Node)) {
                // merge props if there are multiple props definitions
                // does not work if the same key exists on multiple prop definitions
                const props =
                    prevProps !== null
                        ? structuredClone({ ...prevProps, ...param })
                        : { ...param };
                if (prevProps === null) {
                    prevProps = props;
                }
                const indexOfStart = 0;
                const eventKey = 'on';
                for (const [key, value] of Object.entries(props)) {
                    // log({ key, value });
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
                        /* console.log({
                            normalizedEvent,
                            indexOfStart,
                            sliceStart,
                        }); */
                    }
                }
            }
            // log('bottom', { param });
            if (param instanceof Node) {
                try {
                    element.append(param);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
    template.content.append(element);
    // return template.content.cloneNode(true);
    return template.content; // this makes the event handling work since we do not loose the reference to the element.
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
    'span',
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
        // log('cleanupElements', elements);
    }
    createError(`dom: can't cleanup elements Set: ${elements.size > 0}`);
}

function createDOMMethods(done = null) {
    for (const el of elements) {
        dom.set(el, (...params) => {
            const memo = createMemo((...params) =>
                createMountable(el, ...params)
            );
            // return memo(...params); // using memo  creates issues when creating multiple elements with data from an array
            return createMountable(el, ...params);
        });
    }
    if (done && typeof done === 'function') done();
}

createDOMMethods(() => cleanupElements());

// log({ dom });

// log(dom.get('div')('Hello There'));

function createRoot(root = null) {
    if (root instanceof Node) {
        for (const { element, event } of eventHandlers) {
            const [name, fn] = event;
            // log(element, event);
            root.addEventListener(name, (e) => {
                // log({ e, target: e.target, element });
                if (e.target === element) {
                    // log('match!');
                    fn(e);
                }
            });
        }
        return eventHandlers.clear();
    }
    createError('dom: Expected root to be an instance of NodePrototype');
}

export function render(root, ...mountables) {
    if (typeof root === 'function') {
        root = root();
    }
    const results = [];
    const loop = (done = null) => {
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
            createError('dom: exprected position to be of value Number');
        const rootChildren = root.querySelectorAll('*');
        if (position === null) {
            // console.log({ root });
            for (const child of rootChildren) {
                child.remove();
            }
            return;
        }
        for (let index = 0; index < rootChildren.length; index++) {
            if (index === position) {
                const mountable = rootChildren[index];
                mountable.remove();
            }
        }
    };
}

function el(el) {
    return (props, ...params) => dom.get(el)(props, ...params);
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
export const span = el('span');
export const br = () => document.createElement('br');

console.timeEnd('dom/internal');
