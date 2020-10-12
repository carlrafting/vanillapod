import error from './error.js';
import debug from './debug.js';
import setElementProperties from './properties';
import setElementAttributes from './attributes';
import setElementTextContent from './text';
import setElementEventHandlers from './events';

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
export function createElement(props) {
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
export function registerElement(elementCreatorFunction) {
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
export function elementHelper(props) {
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
