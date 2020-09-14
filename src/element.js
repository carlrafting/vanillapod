import error from './error.js';
import debug from './debug.js';

const validProps = {
    element: null,
    el: null,
    data: {},
    classList: [],
    classNames: [],
    attributes: {},
    properties: {},
    props: {},
    attrs: {},
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
    (debug() && console.log(`Creating ${props.element || props.el} for ${props.elementCreatorFunction}`));

    if (props.element || props.el) {
        if (!props.el) {
            props.el = props.element;
        }

        let element;

        if (typeof props.el === 'string') {
            (debug() && console.log('Creating element...'));
            element = document.createElement(props.el);
            (debug() && console.log('Created element: ', element));
        } else {
            // in this case props.el is probably a DOM element
            element = props.el;
        }

        if (!element) {
            error(new Error(`element is ${element}`));
        }

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
    if (typeof elementCreatorFunction === 'function') {
        (debug() && console.log(`Registering ${elementCreatorFunction}...`));

        const props = elementCreatorFunction();

        if (typeof props !== 'object') {
            error(new Error(`${elementCreatorFunction} must return an object`));
        }
        
        if (validateProps(props)) {
            return {
                elementCreatorFunction,
                ...props
            };
        }
    }
    
    error(new Error(`${elementCreatorFunction} is not a function`));
}

/**
 * not to be confused with props variable in createElement, 
 * might have to rename that later...
 * 
 * setElementProperties just sets whatever properties you specify 
 * inside a components props or properties key.
 */
export function setElementProperties(element, { props, properties }) {
    if (props || properties) {
        if (!props) {
            props = properties;
        }

        for (const key in props) {
            if (Object.prototype.hasOwnProperty.call(props, key)) {
                element[key] = props[key];
            }
        }
    }

    console.log('no props');
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