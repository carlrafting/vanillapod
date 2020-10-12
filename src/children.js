import debug from './debug.js';
import { createElement, registerElement } from './element.js';
import setElementProperties from './properties.js';
import setElementAttributes from './attributes.js';
import setElementEventHandlers from './events.js';
import setElementTextContent from './text.js';
import { registerHooks } from './hooks.js';

export default function setElementChildren(element, { children }) {
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
