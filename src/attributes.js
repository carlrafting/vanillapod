import debug from './debug.js';

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

    if (attributes || attrs) {
        if (!attributes) {
            attributes = attrs;
        }

        if (typeof attributes === 'function') {
            const attrsObj = attributes();
            setElementAttributes(element, { ...attrsObj });
            return;
        }

        if (typeof attributes === 'object') {
            (debug() && console.log(attributes));
            for (const key in attributes) {
                if (typeof key === 'object') {
                    setElementAttributes(element, key);
                    // return;
                }
                if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                    if (key in element) {
                        element.setAttribute(`${key}`, attributes[key]);
                    }                                        
                }
            }
            return;
        }        

        attributes.forEach(attribute => {
            element.setAttribute(attribute);
        });
    }    
}