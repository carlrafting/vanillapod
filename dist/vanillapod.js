/**
 * vanillapod.js 
 * v0.11.0 
 */
var version = "0.11.0";

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
        if (exception) {
            throw exception;
        }
    }

    errors.push({ exception });
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
 * @param {object} props - props from vanillapod component instance
 */
function createElement(props) {
    (debug() && console.log(`Creating ${props.element || props.el} for ${props.vanillapodComponent}`));

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
            return error(new Error(`element is ${element}`));
        }

        return [
            element,
            props
        ];
    }
    
    return error(new Error(`No element specified on ${props}`));
}

/** 
 * registerElement
 * 
 * register a new vanillapodComponent instance 
 * 
 * TODO: should this be called createComponentInstance or something similar? refactor to separate file?
 * 
 * @param {function} vanillapodComponent - function for vanillapod component
 */
function registerElement(vanillapodComponent, vanillapodComponentProps) {
    if (typeof vanillapodComponent === 'function') {
        (debug() && console.log(`Registering ${vanillapodComponent}...`));

        const props = vanillapodComponentProps ? vanillapodComponent(vanillapodComponentProps) : vanillapodComponent();

        if (typeof props !== 'object' || props === undefined) {
            return error(new Error(`${vanillapodComponent} must return an object`));
        }
        
        if (validateProps(props)) {
            return {
                vanillapodComponent,
                ...props
            };
        }
    }
    
    return error(new Error(`${vanillapodComponent} is not a function`));
}

/**
 * elementHelper
 * 
 * a helper responsible for creating DOM elements and setting attributes, 
 * properties, text content & event handlers.
 * 
 * @param {object} props - props from vanillapod component 
 */
function elementHelper(props) {
    const [ element, elProps ] = createElement(props);

    (debug() && console.log('elementHelper: elProps', elProps));

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
 * mount
 * 
 * @param {HTMLElement} root - parent element to mount elements to
 * @param {*} args - components to mount
 */
function mount(root, ...args) {
    let index = 0;
    let vanillapodComponent;
    let props = {};
    const argsLength = args.length;

    for (; index < argsLength; (index += 1)) {
        const arg = args[index];

        checkType(arg) === 'array' && ([vanillapodComponent, props] = arg);
        checkType(arg) === 'function' && (vanillapodComponent = arg);
        checkType(arg) === 'object' && (vanillapodComponent = () => arg);

        if (!vanillapodComponent) {
            return error(new Error('Could not determine component format'));
        }

        const instance = registerElement(vanillapodComponent, props);

        if (!instance) {
            return error(new Error(`Could not create instance for ${vanillapodComponent}`));
        }

        let { el, element } = instance;

        if (!el) {
            el = element;
            element = null;
            // delete instance.element;
        }

        // if el is a string, use implicit render approach
        if (checkType(el) === 'string') {
            el = elementHelper(instance);
        }

        if (instance.children && instance.children.length > 0) {
            mount(el, ...instance.children);
        }

        registerHooks(el, instance);

        const hooks = el._vanillapod_hooks;
        
        // trigger children before hooks
        // triggerChildrenHooks(el, 'before');

        // trigger element before hook
        if (hooks && hooks.before) {
            triggerHook(el, 'before');
        }

        // mount element to root
        if (root) {
            root.insertBefore(el, null);
        }

        // mount element to document body
        if (!root && document.body) {
            document.body.insertBefore(el, document.body.lastChild);
        }        

        // trigger element mount hook
        if (hooks && hooks.mount) {
            triggerHook(el, 'mount');
        }
        
        // trigger children mount hooks
        // triggerChildrenHooks(el, 'mount');
    }
}

function setElementChildren(element, { children }) {
    if (children && children.length > 0) {
        children.map(child => {
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

export { createDocumentFragment, createElement, debug, elementHelper, errors, mount, registerElement, registerHook, registerHooks, setElementAttributes, setElementChildren, setElementEventHandlers, setElementProperties, setElementTextContent, triggerHook, version };
