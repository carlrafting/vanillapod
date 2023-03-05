export default function setElementProperties(element, { props, properties }) {
    if (props || properties) {
        if (!props) {
            props = properties;
            properties = {};
        }

        for (const key of Object.keys(props)) {
            element[key] = props[key];
        }
    }
}
