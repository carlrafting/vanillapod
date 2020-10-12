/**
 * vanillapod.js 
 * v0.8.3 
 */
var version = "0.8.3";

/**
 * debug
 * 
 * @param {boolean} value - enable or disable debug output
 */
function debug(value=false) {
    if (!value) {
        return window.VANILLAPOD_DEBUG;
    }

    return window.VANILLAPOD_DEBUG = value;
}

let errors = [];

/**
 * error
 * 
 * throw standard error:
 * error(new Error('This is my Error message'));
 * 
 * throw reference error:
 * error(new ReferenceError('This is my ReferenceError message'))
 * 
 * throw custom exception:
 * function CustomException() {}
 * error(new CustomException('This is my CustomException message'))
 * 
 * @param {Error} exception - throw error when debug is enabled, otherwise store in errors array
 */
var error = (exception) => {
    if (debug()) {
        throw exception;
    }

    errors[exception] = { exception };

    return;
};

/**
 * checkType
 * 
 * A more reliable way of checking type of values.
 * 
 * @param {*} value - value to check type of
 */
function checkType(value=null) {
    const sliceStart = 8;
    const sliceEnd = -1;

    return (
        Object
            .prototype
            .toString
            .call(value)
            .slice(sliceStart, sliceEnd)
            .toLowerCase()
    );
}

/**
 * 
 * @param {HTMLElement} parent 
 * @param {function} callback 
 */
function traverseChildNodes(parent=null, callback=() => {}) {
    if (!parent) {
        error(new Error(`Expected parent parameter to be set, was ${parent}`));
    }

    const childCount = parent.childNodes.length;
    const elementHasChildren = childCount > 0;

    if (elementHasChildren) {
        parent.childNodes.forEach(child => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const childHasChildNodes = child.childNodes.length > 0;
                if (childHasChildNodes) {
                    traverseChildNodes(child, (childChild) => {
                        callback(childChild);
                    });
                }

                callback(child);
            }                
        });
    }
}

// const defaultHooks = {};

// element property to store hooks
const key = '_vanillapod_hooks';

function registerHooks(element, { hooks = {} }) {
    if (!hooks) {
        return;
    }

    if (!element[key]) {
        (debug() && console.log(`Registering hooks for ${element}`));
        element[key] = hooks;
        return;
    }

    (debug() && console.log(`Hooks already registered for ${element}`));
}

function registerHook(element, hook) {
    const hooks = element[key];

    if (!hooks[hook]) {
        hooks[hook] = hook;
    }
}

function triggerHook(element, hookName, ...args) {
    const hooks = element[key];

    if (hooks) {
        if (hookName && hooks[hookName]) {
            (debug() && console.log(`Triggering hook ${hookName} for ${element}`));
            hooks[hookName](args);
        }
        return;
    }

    (debug() && console.log(`No hooks registered for ${element}`));
}

function triggerChildrenHooks(el, hookName='') {
    if (hookName === '') {
        // TODO: throw some kind of error?
        return;
    }

    traverseChildNodes(el, (child) => {
        const childHooks = child._vanillapod_hooks;
        if (childHooks && Object.keys(childHooks).length > 0) {
            if (childHooks && childHooks.before) {
                triggerHook(child, hookName);
            }
        }
    });
}

/**
 * setElementProperties
 * 
 * @param {HTMLElement} element - element to set properties on
 * @param {object} props - properties to set on element 
 */
function setElementProperties(element, { props, properties }) {
    if (props || properties) {
        if (!props) {
            props = properties;
            properties = {};
        }

        for (const key in props) {
            if (Object.prototype.hasOwnProperty.call(props, key)) {
                element[key] = props[key];
            }
        }
    }
}

/**
 * setElementAttributes
 * 
 * @param {HTMLElement} element - HTMLElement to set attributes on
 * @param {object} attributes - attributes to set on element 
 */
function setElementAttributes(element, { 
    attributes, 
    attrs, 
    classList, 
    classNames,
    data
}) {
    (debug() && console.log(`Setting attributes for ${element}`));

    if (classList || classNames) {
        if (!classList) {
            classList = classNames;
            classNames = [];
        }
        classList.forEach(className => {
            element.classList.add(className);
        });
    }

    if (data) {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (Array.isArray(key)) {
                    setElementAttributes(element, key);
                }
                element.dataset[key] = data[key];                
            }
        }
    }

    if (attrs || attributes) {
        if (!attrs) {
            attrs = attributes;
            attributes = null;
        }

        if (typeof attrs === 'function') {
            const attrsObj = attrs();
            setElementAttributes(element, { ...attrsObj });
            return;
        }

        if (typeof attrs === 'object') {
            (debug() && console.log(attrs));
            for (const key in attrs) {
                if (typeof key === 'object') {
                    setElementAttributes(element, key);
                    // return;
                }
                if (Object.prototype.hasOwnProperty.call(attrs, key)) {
                    if (key in element) {
                        element.setAttribute(`${key}`, attrs[key]);
                    }                                        
                }
            }
            return;
        }        

        attrs.forEach(attribute => {
            element.setAttribute(attribute);
        });
    }
}

/**
 * setElementTextContent
 * 
 * @param {HTMLElement} element - element to set text content on
 * @param {string} text - text content for element 
 */
function setElementTextContent(element, { text }) {
    if (text && text !== '') {
        element.appendChild(
            document.createTextNode(text)
        );
    }
}

/**
 * setElementEventHandlers
 * 
 * @param {HTMLElement} element - element to set event handlers on
 * @param {object} events - events to set on element 
 */
function setElementEventHandlers(element, { events, on }) {
    if (on || events) {
        if (!on) {
            on = events;
            // reset events object since we're using `on` instead... 
            events = {};
        }

        for (const event in on) {
            if (Object.prototype.hasOwnProperty.call(on, event)) {
                element.addEventListener(`${event}`, on[event], false);              
            }
        }
    }
}

const validProps = {
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
    hooks: {}
};

/**
 * validateProps
 * 
 * make sure props passed in to registerElement are correct
 * 
 * @param {object} props - props to validate 
 */
function validateProps(props) {
    for (const key in props) {
        if (!Object.prototype.hasOwnProperty.call(validProps, key)) {
            error(
                new Error(
                    `${key} is not a valid property name. Try one of the following instead: ` + Object.keys(validProps)
                )
            );
        }
    }

    return true;
}

/**
 * createElement
 * 
 * creates DOM element
 * 
 * @param {object} props - props from vanillapod component
 */
function createElement(props) {
    (debug() && console.log(`Creating ${props.element || props.el} for ${props.elementCreatorFunction}`));

    if (props.el || props.element) {
        if (!props.el) {
            props.el = props.element;
            props.element = null;
        }

        let element;

        if (typeof props.el === 'string') {
            (debug() && console.log('Creating element...'));
            element = document.createElement(props.el);
            (debug() && console.log('Created element: ', element));
        } else {
            // in this case props.el is probably already a DOM element
            element = props.el;
        }

        if (!element) {
            error(new Error(`element is ${element}`));
        }

        return [
            element,
            props
        ];
    }
    
    error(new Error(`No element specified on ${props}`));
}

/** 
 * registerElement
 * 
 * register a new element instance 
 * 
 * @param {function} elementCreatorFunction - function for vanillapod component
 */
function registerElement(elementCreatorFunction) {
    if (typeof elementCreatorFunction === 'function') {
        (debug() && console.log(`Registering ${elementCreatorFunction}...`));

        const props = elementCreatorFunction();

        if (typeof props !== 'object') {
            error(new Error(`${elementCreatorFunction} must return an object`));
        }
        
        if (validateProps(props)) {
            return {
                elementCreatorFunction,
                ...props
            };
        }
    }
    
    error(new Error(`${elementCreatorFunction} is not a function`));
}

/**
 * elementHelper
 * 
 * a helper responsible for creating DOM elements and setting attributes, 
 * -properties, text content & event handlers.
 * 
 * @param {object} props - props from vanillapod component 
 */
function elementHelper(props) {
    const [ element, elProps ] = createElement(props);

    console.log('elementHelper: elProps', elProps);

    // set element properties
    setElementProperties(element, elProps);

    // set attributes on elements
    setElementAttributes(element, elProps);

    // set textContent for element
    setElementTextContent(element, elProps);

    // register DOM event handlers
    setElementEventHandlers(element, elProps);

    return element;
}

/**
 * setElementChildren
 * 
 * @param {HTMLElement} element - element to attach children to
 * @param {object} props - vanillapod component props
 */
function setElementChildren(element, props) {
    if (props.children && props.children.length > 0) {
        props.children.map(child => {
            const childInstance = registerElement(child);
            const [childElement, childProps] = createElement(childInstance);
            (debug() && (
                console.log('childInstance', childInstance) &&
                console.log('childElement', childElement) &&
                console.log('childProps', childProps)
            ));
            setElementProperties(
                childElement, 
                childProps
            );
            setElementAttributes(
                childElement,
                childProps
            );
            setElementTextContent(
                childElement,
                childProps
            );
            setElementEventHandlers(
                childElement,
                childProps
            );
            registerHooks(
                childElement, 
                childProps
            );
            if (childProps.children) {
                setElementChildren(childElement, childProps);
            }

            element.appendChild(childElement);
        });
    }
}

/**
 * mount
 * 
 * @param {HTMLElement} root - parent element to mount elements to
 * @param {*} args - components to mount  
 */
function mount(root, ...args) {
    args.forEach(arg => {
        if (checkType(arg) !== 'function') {
            error(new Error('arg must be a function'));
        }

        const elementCreatorFunction = arg;
        const instance = registerElement(elementCreatorFunction);
        let { el, element } = instance;

        if (!el) {
            el = element;
            element = null;
        }

        // if el is a string, use implicit render approach
        if (checkType(el) === 'string') {
            el = elementHelper(instance);
            setElementChildren(el, instance);
            registerHooks(el, instance);
        }

        const hooks = el._vanillapod_hooks;
        
        // trigger children before hooks
        triggerChildrenHooks(el, 'before');

        // trigger element before hook
        if (hooks && hooks.before) {
            triggerHook(el, 'before');
        }

        // mount element to root or document body element

        if (root) {
            root.insertBefore(el, null);
        }

        if (!root) {
            const body = document.querySelector('body');
            body.insertBefore(el, body.lastChild);
        }        

        // trigger element mount hook
        if (hooks && hooks.mount) {
            triggerHook(el, 'mount');
        }

        // trigger children mount hooks
        triggerChildrenHooks(el, 'mount');
    });
}

function unmount() {
    error(new Error('unmount yet to be implemented!'));
}

/**
 * createDocumentFragment
 *  
 * @param {object} props - props from vanillapod component
 */
function createDocumentFragment(props = {}) {
    const fragment = document.createDocumentFragment();

    setElementProperties(fragment, props);
    setElementTextContent(fragment, props);
    setElementEventHandlers(fragment, props);

    return [
        fragment,
        props
    ];
}

export { createDocumentFragment, createElement, debug, elementHelper, mount, registerElement, registerHook, registerHooks, setElementAttributes, setElementChildren, setElementEventHandlers, setElementProperties, setElementTextContent, triggerHook, unmount, version };
