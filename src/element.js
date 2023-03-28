import { createError } from './error.js';
import debug from './debug.js';
import setElementProperties from './properties.js';
import setElementAttributes from './attributes.js';
import setElementTextContent from './text.js';
import setElementEventHandlers from './events.js';

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

export function validateProps(props) {
    for (const key in props) {
        if (!Object.hasOwn(validProps, key)) {
            return createError(
                `${key} is not a valid property name. Try one of the following instead: ${Object.keys(
                    validProps
                )}`
            );
        }
    }

    return true;
}

export function createComponentInstance(
    vanillapodComponent,
    vanillapodComponentProps
) {
    if (typeof vanillapodComponent === 'function') {
        debug() && console.log(`Registering ${vanillapodComponent}...`);

        let props = vanillapodComponentProps
            ? vanillapodComponent(vanillapodComponentProps)
            : vanillapodComponent();

        if (typeof props !== 'object' || props === undefined) {
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

export function createElement(element, ...args /* props = {} */) {
    let props = {};

    for (const arg of args) {
        if (Array.isArray(arg)) {
            props.children = arg;
            break;
        }
        if (typeof arg === 'function') {
            props = typeof arg() === 'object' && arg();
            break;
        }
        props = arg;
    }

    // console.log(props);

    if (!element) {
        return createError(`element is ${element}`);
    }

    if (typeof element === 'string') {
        // (debug() && console.log(`Creating ${element} for ${props.vanillapodComponent}`));
        debug() && console.log('Creating element...');
        element = document.createElement(element);
        debug() && console.log('Created element: ', element);
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
            'createElement: props',
            props,
            'createElement: element',
            element
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
