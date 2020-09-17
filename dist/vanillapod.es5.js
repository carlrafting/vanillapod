var vanillapod = (function (exports) {
  'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function debug() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

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

  var errors = [];
  var error = (function (exception) {
    if (debug()) {
      throw exception;
    }

    errors[exception] = {
      exception: exception
    };
  });

  var validProps = {
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
    for (var key in props) {
      if (!Object.prototype.hasOwnProperty.call(validProps, key)) {
        error(new Error("".concat(key, " is not a valid property name. Try one of the following instead: ") + Object.keys(validProps)));
      }
    }

    return true;
  }
  /**
   * creates DOM element
   */


  function createElement(props) {
    debug() && console.log("Creating ".concat(props.element || props.el, " for ").concat(props.elementCreatorFunction));

    if (props.el || props.element) {
      if (!props.el) {
        props.el = props.element;
      }

      var element;

      if (typeof props.el === 'string') {
        debug() && console.log('Creating element...');
        element = document.createElement(props.el);
        debug() && console.log('Created element: ', element);
      } else {
        // in this case props.el is probably a DOM element
        element = props.el;
      }

      if (!element) {
        error(new Error("element is ".concat(element)));
      }

      return [element, props];
    }

    error(new Error("No element specified on ".concat(props)));
  }
  /** 
   * register a new element instance 
   */

  function registerElement(elementCreatorFunction) {
    if (typeof elementCreatorFunction === 'function') {
      debug() && console.log("Registering ".concat(elementCreatorFunction, "..."));
      var props = elementCreatorFunction();

      if (_typeof(props) !== 'object') {
        error(new Error("".concat(elementCreatorFunction, " must return an object")));
      }

      if (validateProps(props)) {
        return _objectSpread2({
          elementCreatorFunction: elementCreatorFunction
        }, props);
      }
    }

    error(new Error("".concat(elementCreatorFunction, " is not a function")));
  }
  /**
   * not to be confused with props variable in createElement, 
   * might have to rename that later...
   * 
   * setElementProperties just sets whatever properties you specify 
   * inside a components props or properties key.
   */

  function setElementProperties(element, _ref) {
    var props = _ref.props,
        properties = _ref.properties;

    if (props || properties) {
      if (!props) {
        props = properties;
      }

      for (var key in props) {
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

  function elementHelper() {
    var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var text = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
    var events = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var children = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
    return _objectSpread2(_objectSpread2({
      element: element,
      text: text
    }, attributes()), {}, {
      events: events,
      children: children
    });
  }

  function setElementAttributes(element, _ref) {
    var attributes = _ref.attributes,
        attrs = _ref.attrs,
        classList = _ref.classList,
        classNames = _ref.classNames,
        data = _ref.data;
    debug() && console.log("Setting attributes for ".concat(element));

    if (classList || classNames) {
      if (!classList) {
        classList = classNames;
      }

      classList.forEach(function (className) {
        element.classList.add(className);
      });
    }

    if (data) {
      for (var key in data) {
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
        var attrsObj = attributes();
        setElementAttributes(element, _objectSpread2({}, attrsObj));
        return;
      }

      if (_typeof(attributes) === 'object') {
        debug() && console.log(attributes);

        for (var _key in attributes) {
          if (_typeof(_key) === 'object') {
            setElementAttributes(element, _key); // return;
          }

          if (Object.prototype.hasOwnProperty.call(attributes, _key)) {
            if (_key in element) {
              element.setAttribute("".concat(_key), attributes[_key]);
            }
          }
        }

        return;
      }

      attributes.forEach(function (attribute) {
        element.setAttribute(attribute);
      });
    }
  }

  function setElementTextContent(element, _ref) {
    var text = _ref.text;

    if (text && text !== '') {
      element.appendChild(document.createTextNode(text));
    }
  }

  function setElementEventHandlers(element, _ref) {
    var _ref$events = _ref.events,
        events = _ref$events === void 0 ? {} : _ref$events;

    if (events) {
      for (var event in events) {
        if (Object.prototype.hasOwnProperty.call(events, event)) {
          element.addEventListener("".concat(event), events[event], false);
        }
      }
    }
  }

  function setElementChildren(element, props) {
    if (props.children && props.children.length > 0) {
      props.children.map(function (child) {
        // const childProps = child();
        // const childElement = document.createElement(childProps.element);
        var childInstance = registerElement(child);

        var _createElement = createElement(childInstance),
            _createElement2 = _slicedToArray(_createElement, 2),
            childElement = _createElement2[0],
            childProps = _createElement2[1];

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
    var instance = registerElement(elementCreatorFunction);
    debug() && console.log('Element instance: ', instance);

    var _createElement = createElement(instance),
        _createElement2 = _slicedToArray(_createElement, 2),
        element = _createElement2[0],
        props = _createElement2[1]; // set element properties


    setElementProperties(element, props); // set attributes on elements

    setElementAttributes(element, props); // set textContent for elements

    setElementTextContent(element, props); // register DOM event handlers

    setElementEventHandlers(element, props); // attach element children

    setElementChildren(element, props); // TODO: register hooks

    return {
      element: element
    };
  }

  function mount(root) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    args.forEach(function (arg) {
      var elementCreatorFunction = arg;

      var _bootstrap = bootstrap(elementCreatorFunction),
          element = _bootstrap.element;

      if (root) {
        root.appendChild(element);
        return;
      }

      var body = document.querySelector('body');
      body.appendChild(element);
    });
  }

  exports.debug = debug;
  exports.elementHelper = elementHelper;
  exports.mount = mount;

  return exports;

}({}));
