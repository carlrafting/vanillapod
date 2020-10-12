import debug from './debug.js';

/**
 * setElementAttributes
 * 
 * @param {HTMLElement} element - HTMLElement to set attributes on
 * @param {object} attributes - attributes to set on element 
 */
export default function setElementAttributes(element, { 
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
