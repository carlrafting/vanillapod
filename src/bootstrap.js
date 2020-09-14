import debug from './debug.js';
import { registerElement, createElement } from './element.js';
import setElementAttributes from './attributes.js';
import setElementTextContent from './text.js';
import setElementChildren from './children.js';
import setElementEventHandlers from './events.js';

export default function bootstrap(elementCreatorFunction) {
    // create required element instances
    const instance = registerElement(elementCreatorFunction);

    (debug() && console.log('instance', instance));

    const [ element, props ] = createElement(instance);

    // set attributes on elements
    setElementAttributes(element, props);

    // set textContent for elements
    setElementTextContent(element, props);

    // register DOM event handlers
    setElementEventHandlers(element, props);

    // attach element children
    setElementChildren(element, props);

    // TODO: register hooks
    
    return {
        element
    };
}