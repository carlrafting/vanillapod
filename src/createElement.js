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
                if (attributes.hasOwnProperty(key)) {
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
            if (events.hasOwnProperty(event)) {
                element.addEventListener(`${event}`, events[event], false);                 
            }
        }
    }
}

export default function createElement(elementObject) {
    const [name, instance] = elementObject;
    let children = [];
    console.log(name, instance);

    console.log('Creating element...');
    const mainElement = document.createElement(instance.element);
    console.log('Created element: ', mainElement);

    console.log('Setting attributes for element...');
    setElementAttributes(mainElement, instance);

    console.log('Setting text for element...');
    setElementTextContent(mainElement, instance);

    console.log('Attaching event handlers...');
    setElementEventHandlers(mainElement, instance);

    if (instance.children && instance.children.length > 0) {
        console.log('Creating children...');
        children = instance.children.map((child, i) => {
            const childInstance = child();
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
            return childElement;
        });
        console.log('Created children:', children);
    }

    return [
        mainElement,
        children
    ];
}