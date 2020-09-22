import debug from './debug.js';
import { registerElement, createElement, setElementProperties } from './element.js';
import setElementAttributes from './attributes.js';
import setElementTextContent from './text.js';
import setElementChildren from './children.js';
import setElementEventHandlers from './events.js';
import { registerHooks } from './hooks.js';

export default function bootstrap(elementCreatorFunction) {
    // create required element instances
    const instance = registerElement(elementCreatorFunction);

    if (typeof instance.element === 'string') {
        (debug() && console.log('Element instance: ', instance));

        const [ element, props ] = createElement(instance);

        // set element properties
        setElementProperties(element, props);

        // set attributes on elements
        setElementAttributes(element, props);

        // set textContent for elements
        setElementTextContent(element, props);

        // register DOM event handlers
        setElementEventHandlers(element, props);

        // attach element children
        setElementChildren(element, props);

        // register hooks
        registerHooks(element, props);
    }
    
    const { element } = instance;

    return {
        element
    };
}
