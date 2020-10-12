import debug from './debug.js';
import { registerElement, createElement } from './element.js';
import setElementProperties from './properties';
import setElementAttributes from './attributes.js';
import setElementTextContent from './text.js';
import setElementChildren from './children.js';
import setElementEventHandlers from './events.js';
import { registerHooks } from './hooks.js';

/**
 * bootstrap
 * 
 * @param {function} elementCreatorFunction - function responsible for creating component element
 */
export default function bootstrap(elementCreatorFunction) {
    // create required element instances
    const instance = registerElement(elementCreatorFunction);

    const { el, element } = instance;

    if (typeof element === 'string' || typeof el === 'string') {
        (debug() && console.log('Element instance: ', instance));

        const [ createdElement, props ] = createElement(instance);

        // set element properties
        setElementProperties(createdElement, props);

        // set attributes on elements
        setElementAttributes(createdElement, props);

        // set textContent for elements
        setElementTextContent(createdElement, props);

        // register DOM event handlers
        setElementEventHandlers(createdElement, props);

        // attach element children
        setElementChildren(createdElement, props);

        // register hooks
        registerHooks(createdElement, props);

        return {
            element: createdElement,
            el: createdElement
        };
    }
    
    return {
        element,
        el
    };
}
