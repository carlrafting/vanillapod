/**
 * setElementProperties
 * 
 * @param {HTMLElement} element - element to set properties on
 * @param {object} props - properties to set on element 
 */
export default function setElementProperties(element, { props, properties }) {
    if (props || properties) {
        if (!props) {
            props = properties;
            properties = {};
        }

        for (const key in props) {
            if (Object.prototype.hasOwnProperty.call(props, key)) {
                element[key] = props[key];
            }
        }
    }
}
