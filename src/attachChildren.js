import debug from './debug.js';

export default function attachChildren([element, children]) {
    (debug() && (
        console.log('Attaching children to element...') &&
        console.log('element', element)
    ));
    if (children) {
        (debug() && console.log('children', children));
        children.forEach(child => {
            const { childElement } = child;

            (debug() && console.log('childElement', childElement));

            // if (children && children.length > 0) {
            //     attachChildren([childElement, { children }]);
            // }

            element.appendChild(child[0]);
        });
        // if (children.children) {
        //     attachChildren(children)
        // }
    }
    (debug() && console.log('Attached children to element ', element, children));

    return element;
}
