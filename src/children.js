import debug from './debug.js';
import { createElement, registerElement, setElementProperties } from './element.js';
import setElementAttributes from './attributes.js';
import setElementEventHandlers from './events.js';
import setElementTextContent from './text.js';

export default function setElementChildren(element, props) {
    if (props.children && props.children.length > 0) {
        props.children.map(child => {
            // const childProps = child();
            // const childElement = document.createElement(childProps.element);
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
            if (childProps.children) {
                setElementChildren(childElement, childProps);
            }

            element.appendChild(childElement);
        });
    }
}