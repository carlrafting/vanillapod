import error from './error.js';
import debug from './debug.js';

const validProps = {
    element: null,
    el: null,
    data: {},
    classList: [],
    classNames: [],
    attributes: [],
    attrs: [],
    children: [],
    text: null,
    events: {},
    hooks: {}
};

/**
 * make sure props passed in to register is correct
 */
function validateProps(props) {
    for (const key in props) {
        if (!Object.prototype.hasOwnProperty.call(validProps, key)) {
            error(
                new Error(
                    `${key} is not a valid property name. Try one of the following instead: ` + Object.keys(validProps)
                )
            );
        }
    }

    return true;
}

/**
 * creates DOM element
 */
export function createElement(props) {
    (debug() && console.log(`Creating ${props.element} for ${props.create}`));

    if (props.element) {
        (debug() && console.log('Creating element...'));
        const element = document.createElement(props.element);
        (debug() && console.log('Created element: ', element));

        return [
            element,
            props
        ];
    }
    
    error(new Error(`No element specified on ${props}`));
}

/** 
 * register a new element instance 
 */
export function registerElement(elementCreatorFunction) {
    (debug() && console.log(`Registering ${elementCreatorFunction}`));

    if (typeof elementCreatorFunction === 'function') {
        const props = elementCreatorFunction();

        if (typeof props !== 'object') {
            error(new Error(`${elementCreatorFunction} must return an object`));
        }
        
        if (validateProps(props)) {
            return {
                create: elementCreatorFunction,
                ...props
            };
        }
    }
    
    error(new Error(`${elementCreatorFunction} is not a function`));
}

// A helper one can use to create elements within components
//
// Example:
// 
// import { helper } from 'path/to/element.js';
//
// export default function foobar() {
//     function attrs() {
//         return {
//             classList: ['foo', 'bar'],
//             data: {
//                 foo: 'bar',
//                 hello: ['world', 'hello']
//             },
//             attributes: {
//                 value: 'foo'
//             }
//         }
//     };
//
//     return helper(
//         'div',
//         'hello there',
//         attrs,
//         {
//             click(e) { console.log(target) }
//         },
//         [ bar ]
//     );
// }
//
export function helper(
    element='',
    text='',
    attributes=function(){},
    events={},
    children=[]
) {
    return {
        element,
        text,
        ...attributes(),
        events,
        children
    };
}