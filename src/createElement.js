function setElementAttributes(element, { attributes, classList, data }) {
    if (classList) {
        classList.forEach(className => {
            element.classList.add(className);
        });
    }

    if (data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (typeof key === 'array') {
                    setElementAttributes(element, key);
                }
                element.dataset[key] = data[key];                
            }
        }
    }

    if (attributes) {
        if (typeof attributes === 'function') {
            const attr = attributes();
            setElementAttributes(element, attr);
            return;
        }

        if (typeof attributes === 'object') {
            console.log(attributes);
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

function setElementTextContent(element, { text }) {
    if (text) {
        element.appendChild(
            document.createTextNode(text)
        );
    }
}

function setElementEventHandlers(element, { events = {} }) {
    if (events) {
        for (const event in events) {
            if (Object.prototype.hasOwnProperty.call(events, event)) {
                element.addEventListener(`${event}`, events[event], false);              
            }
        }
    }
}

function createElementChildren(instance) {
    if (instance.children) {
        return instance.children.map((child, i) => {
            const childInstance = child();
            console.log('childInstance', childInstance);
            const childElement = document.createElement(childInstance.element)
            setElementAttributes(
                childElement,
                childInstance
            );
            setElementTextContent(
                childElement,
                childInstance
            );
            setElementEventHandlers(
                childElement,
                childInstance
            );
            let children;
            if (childInstance.children) {
                children = createElementChildren(childInstance);
            }
            return [childElement, children];
        });
    }

    return [];
}

export default function createElement(elementObject) {
    const [name, instance] = elementObject;
    console.log(name, instance);

    console.log('Creating element...');
    const element = document.createElement(instance.element);
    console.log('Created element: ', element);

    console.log('Setting attributes for element...');
    setElementAttributes(element, instance);

    console.log('Setting text for element...');
    setElementTextContent(element, instance);

    console.log('Attaching event handlers...');
    setElementEventHandlers(element, instance);

    let children = [];
    if (instance.children && instance.children.length > 0) {
        console.log('Creating children...');
        children = createElementChildren(instance);
        console.log('Created children:', children);
    }

    return [
        element,
        children
    ];
}