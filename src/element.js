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
 * TODO: should this be called createComponentInstance or something similar? refactor to separate file?
 * 
 * @param {function} vanillapodComponent - function for vanillapod component
 */
export function registerElement(vanillapodComponent, vanillapodComponentProps) {
    if (typeof vanillapodComponent === 'function') {
        (debug() && console.log(`Registering ${vanillapodComponent}...`));

        const props = vanillapodComponentProps ? vanillapodComponent(vanillapodComponentProps) : vanillapodComponent();

        if (typeof props !== 'object') {
            error(new Error(`${vanillapodComponent} must return an object`));
        }
        
        if (validateProps(props)) {
            return {
                vanillapodComponent,
                ...props
            };
        }
    }
    
    error(new Error(`${vanillapodComponent} is not a function`));
}

/**
 * elementHelper
 * 
 * a helper responsible for creating DOM elements and setting attributes, 
 * properties, text content & event handlers.
 * 
 * @param {object} props - props from vanillapod component 
 */
export function elementHelper(props) {
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
