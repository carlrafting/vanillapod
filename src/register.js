const validProps = {
    element: null,
    data: {},
    classList: [],
    attributes: [],
    children: [],
    text: null,
    events: {}
};

function validateProps(props) {
    for (const key in props) {
        if (!Object.prototype.hasOwnProperty.call(validProps, key)) {
            throw new Error(
                `${key} is not a valid property name. Try one of the following instead: ` + Object.keys(validProps)
            );            
        }
    }
}

export default function registerElement(name, props) {
    validateProps(props);

    return [name, props];
}

let count = 0;

export function doRegister(element) {
    const instance = element();
    const name =  `element-${count++}`;

    return registerElement(name, instance);
}
