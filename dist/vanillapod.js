function debug(value = false) {
  if (!value) {
    return window.VANILLAPOD_DEBUG;
  }

  return window.VANILLAPOD_DEBUG = value;
}

//
// usage:
//
// import error from 'error';
//
// throw standard error
// error(new Error('This is my Error message'));
//
// throw reference error
// error(new ReferenceError('This is my ReferenceError message'))
//
// throw custom exception
// function CustomException() {}
// error(new CustomException('This is my CustomException message'))

const errors = [];
var error = (exception => {
  if (debug()) {
    throw exception;
  }

  errors[exception] = {
    exception
  };
});

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
      error(new Error(`${key} is not a valid property name. Try one of the following instead: ` + Object.keys(validProps)));
    }
  }

  return true;
}
/**
 * creates DOM element
 */


function createElement(props) {
  debug() && console.log(`Creating ${props.element || props.el} for ${props.elementCreatorFunction}`);

  if (props.element || props.el) {
    if (!props.el) {
      props.el = props.element;
    }

    let element;

    if (typeof props.el === 'string') {
      debug() && console.log('Creating element...');
      element = document.createElement(props.el);
      debug() && console.log('Created element: ', element);
    } else {
      // in this case props.el is probably a DOM element
      element = props.el;
    }

    if (!element) {
      error(new Error(`element is ${element}`));
    }

    return [element, props];
  }

  error(new Error(`No element specified on ${props}`));
}
/** 
 * register a new element instance 
 */

function registerElement(elementCreatorFunction) {
  if (typeof elementCreatorFunction === 'function') {
    debug() && console.log(`Registering ${elementCreatorFunction}...`);
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

function setElementProperties(element, {
  props,
  properties
}) {
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
} // A helper one can use to create elements within components
//
// Example:
// 
// import { elementHelper } from 'vanillapod/element';
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

function elementHelper(element = '', text = '', attributes = function () {}, events = {}, children = []) {
  return {
    element,
    text,
    ...attributes(),
    events,
    children
  };
}

function setElementAttributes(element, {
  attributes,
  attrs,
  classList,
  classNames,
  data
}) {
  debug() && console.log(`Setting attributes for ${element}`);

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
      setElementAttributes(element, { ...attrsObj
      });
      return;
    }

    if (typeof attributes === 'object') {
      debug() && console.log(attributes);

      for (const key in attributes) {
        if (typeof key === 'object') {
          setElementAttributes(element, key); // return;
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

function setElementTextContent(element, {
  text
}) {
  if (text && text !== '') {
    element.appendChild(document.createTextNode(text));
  }
}

function setElementEventHandlers(element, {
  events = {}
}) {
  if (events) {
    for (const event in events) {
      if (Object.prototype.hasOwnProperty.call(events, event)) {
        element.addEventListener(`${event}`, events[event], false);
      }
    }
  }
}

function setElementChildren(element, props) {
  if (props.children && props.children.length > 0) {
    props.children.map(child => {
      // const childProps = child();
      // const childElement = document.createElement(childProps.element);
      const childInstance = registerElement(child);
      const [childElement, childProps] = createElement(childInstance);
      debug() && console.log('childInstance', childInstance) && console.log('childElement', childElement) && console.log('childProps', childProps);
      setElementProperties(childElement, childProps);
      setElementAttributes(childElement, childProps);
      setElementTextContent(childElement, childProps);
      setElementEventHandlers(childElement, childProps);

      if (childProps.children) {
        setElementChildren(childElement, childProps);
      }

      element.appendChild(childElement);
    });
  }
}

function bootstrap(elementCreatorFunction) {
  // create required element instances
  const instance = registerElement(elementCreatorFunction);
  debug() && console.log('Element instance: ', instance);
  const [element, props] = createElement(instance); // set element properties

  setElementProperties(element, props); // set attributes on elements

  setElementAttributes(element, props); // set textContent for elements

  setElementTextContent(element, props); // register DOM event handlers

  setElementEventHandlers(element, props); // attach element children

  setElementChildren(element, props); // TODO: register hooks

  return {
    element
  };
}

function mount(root, ...args) {
  args.forEach(arg => {
    const elementCreatorFunction = arg;
    const {
      element
    } = bootstrap(elementCreatorFunction);

    if (root) {
      root.appendChild(element);
      return;
    }

    const body = document.querySelector('body');
    body.appendChild(element);
  });
}

export { debug, elementHelper, mount };
