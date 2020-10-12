/**
 * vanillapod.js 
 * v0.9.0 
 */
var vanillapod = (function (exports) {
  'use strict';

  var version = "0.9.0";

  /**
   * debug
   * 
   * @param {boolean} value - enable or disable debug output
   */
  function debug() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (!value) {
      return window.VANILLAPOD_DEBUG;
    }

    return window.VANILLAPOD_DEBUG = value;
  }

  var errors = [];
  /**
   * error
   * 
   * throw standard error:
   * error(new Error('This is my Error message'));
   * 
   * throw reference error:
   * error(new ReferenceError('This is my ReferenceError message'))
   * 
   * throw custom exception:
   * function CustomException() {}
   * error(new CustomException('This is my CustomException message'))
   * 
   * @param {Error} exception - throw error when debug is enabled, otherwise store in errors array
   */

  var error = (function (exception) {
    if (debug()) {
      throw exception;
    }

    errors[exception] = {
      exception: exception
    };
    return;
  });

  /**
   * checkType
   * 
   * A more reliable way of checking type of values.
   * 
   * @param {*} value - value to check type of
   */

  function checkType() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var sliceStart = 8;
    var sliceEnd = -1;
    return Object.prototype.toString.call(value).slice(sliceStart, sliceEnd).toLowerCase();
  }
  /**
   * 
   * @param {HTMLElement} parent 
   * @param {function} callback 
   */

  function traverseChildNodes() {
    var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

    if (!parent) {
      error(new Error("Expected parent parameter to be set, was ".concat(parent)));
    }

    var childCount = parent.childNodes.length;
    var elementHasChildren = childCount > 0;

    if (elementHasChildren) {
      parent.childNodes.forEach(function (child) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          var childHasChildNodes = child.childNodes.length > 0;

          if (childHasChildNodes) {
            traverseChildNodes(child, function (childChild) {
              callback(childChild);
            });
          }

          callback(child);
        }
      });
    }
  }

  // element property to store hooks

  var key = '_vanillapod_hooks';

  function registerHooks(element, _ref) {
    var _ref$hooks = _ref.hooks,
        hooks = _ref$hooks === void 0 ? {} : _ref$hooks;

    if (!hooks) {
      return;
    }

    if (!element[key]) {
      debug() && console.log("Registering hooks for ".concat(element));
      element[key] = hooks;
      return;
    }

    debug() && console.log("Hooks already registered for ".concat(element));
  }

  function registerHook(element, hook) {
    var hooks = element[key];

    if (!hooks[hook]) {
      hooks[hook] = hook;
    }
  }

  function triggerHook(element, hookName) {
    var hooks = element[key];

    if (hooks) {
      if (hookName && hooks[hookName]) {
        debug() && console.log("Triggering hook ".concat(hookName, " for ").concat(element));

        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        hooks[hookName](args);
      }

      return;
    }

    debug() && console.log("No hooks registered for ".concat(element));
  }

  function triggerChildrenHooks(el) {
    var hookName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    if (hookName === '') {
      // TODO: throw some kind of error?
      return;
    }

    traverseChildNodes(el, function (child) {
      var childHooks = child._vanillapod_hooks;

      if (childHooks && Object.keys(childHooks).length > 0) {
        if (childHooks && childHooks.before) {
          triggerHook(child, hookName);
        }
      }
    });
  }

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

  /**
   * setElementProperties
   * 
   * @param {HTMLElement} element - element to set properties on
   * @param {object} props - properties to set on element 
   */
  function setElementProperties(element, _ref) {
    var props = _ref.props,
        properties = _ref.properties;

    if (props || properties) {
      if (!props) {
        props = properties;
        properties = {};
      }

      for (var key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
          element[key] = props[key];
        }
      }
    }
  }

  /**
   * setElementAttributes
   * 
   * @param {HTMLElement} element - HTMLElement to set attributes on
   * @param {object} attributes - attributes to set on element 
   */

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
        classNames = [];
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

    if (attrs || attributes) {
      if (!attrs) {
        attrs = attributes;
        attributes = null;
      }

      if (typeof attrs === 'function') {
        var attrsObj = attrs();
        setElementAttributes(element, _objectSpread2({}, attrsObj));
        return;
      }

      if (_typeof(attrs) === 'object') {
        debug() && console.log(attrs);

        for (var _key in attrs) {
          if (_typeof(_key) === 'object') {
            setElementAttributes(element, _key); // return;
          }

          if (Object.prototype.hasOwnProperty.call(attrs, _key)) {
            if (_key in element) {
              element.setAttribute("".concat(_key), attrs[_key]);
            }
          }
        }

        return;
      }

      attrs.forEach(function (attribute) {
        element.setAttribute(attribute);
      });
    }
  }

  /**
   * setElementTextContent
   * 
   * @param {HTMLElement} element - element to set text content on
   * @param {string} text - text content for element 
   */
  function setElementTextContent(element, _ref) {
    var text = _ref.text;

    if (text && text !== '') {
      element.appendChild(document.createTextNode(text));
    }
  }

  /**
   * setElementEventHandlers
   * 
   * @param {HTMLElement} element - element to set event handlers on
   * @param {object} events - events to set on element 
   */
  function setElementEventHandlers(element, _ref) {
    var events = _ref.events,
        on = _ref.on;

    if (on || events) {
      if (!on) {
        on = events; // reset events object since we're using `on` instead... 

        events = {};
      }

      for (var event in on) {
        if (Object.prototype.hasOwnProperty.call(on, event)) {
          element.addEventListener("".concat(event), on[event], false);
        }
      }
    }
  }

  var validProps = {
    element: null,
    el: null,
    data: {},
    classList: [],
    classNames: [],
    attributes: {},
    attrs: {},
    properties: {},
    props: {},
    children: [],
    text: null,
    events: {},
    on: {},
    hooks: {}
  };
  /**
   * validateProps
   * 
   * make sure props passed in to registerElement are correct
   * 
   * @param {object} props - props to validate 
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
   * createElement
   * 
   * creates DOM element
   * 
   * @param {object} props - props from vanillapod component
   */


  function createElement(props) {
    debug() && console.log("Creating ".concat(props.element || props.el, " for ").concat(props.elementCreatorFunction));

    if (props.el || props.element) {
      if (!props.el) {
        props.el = props.element;
        props.element = null;
      }

      var element;

      if (typeof props.el === 'string') {
        debug() && console.log('Creating element...');
        element = document.createElement(props.el);
        debug() && console.log('Created element: ', element);
      } else {
        // in this case props.el is probably already a DOM element
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
   * registerElement
   * 
   * register a new element instance 
   * 
   * @param {function} elementCreatorFunction - function for vanillapod component
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
   * elementHelper
   * 
   * a helper responsible for creating DOM elements and setting attributes, 
   * -properties, text content & event handlers.
   * 
   * @param {object} props - props from vanillapod component 
   */

  function elementHelper(props) {
    var _createElement = createElement(props),
        _createElement2 = _slicedToArray(_createElement, 2),
        element = _createElement2[0],
        elProps = _createElement2[1];

    console.log('elementHelper: elProps', elProps); // set element properties

    setElementProperties(element, elProps); // set attributes on elements

    setElementAttributes(element, elProps); // set textContent for element

    setElementTextContent(element, elProps); // register DOM event handlers

    setElementEventHandlers(element, elProps);
    return element;
  }

  function setElementChildren(element, _ref) {
    var children = _ref.children;

    if (children && children.length > 0) {
      children.map(function (child) {
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
        registerHooks(childElement, childProps);

        if (childProps.children) {
          setElementChildren(childElement, childProps);
        }

        element.appendChild(childElement);
      });
    }
  }

  /**
   * mount
   * 
   * @param {HTMLElement} root - parent element to mount elements to
   * @param {*} args - components to mount  
   */

  function mount(root) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    args.forEach(function (arg) {
      if (checkType(arg) !== 'function') {
        error(new Error('arg must be a function'));
      }

      var elementCreatorFunction = arg;
      var instance = registerElement(elementCreatorFunction);
      var el = instance.el,
          element = instance.element;

      if (!el) {
        el = element;
        element = null;
      } // if el is a string, use implicit render approach


      if (checkType(el) === 'string') {
        el = elementHelper(instance);
        setElementChildren(el, instance);
        registerHooks(el, instance);
      }

      var hooks = el._vanillapod_hooks; // trigger children before hooks

      triggerChildrenHooks(el, 'before'); // trigger element before hook

      if (hooks && hooks.before) {
        triggerHook(el, 'before');
      } // mount element to root or document body element


      if (root) {
        root.insertBefore(el, null);
      }

      if (!root) {
        var body = document.querySelector('body');
        body.insertBefore(el, body.lastChild);
      } // trigger element mount hook


      if (hooks && hooks.mount) {
        triggerHook(el, 'mount');
      } // trigger children mount hooks


      triggerChildrenHooks(el, 'mount');
    });
  }

  function unmount() {
    error(new Error('unmount yet to be implemented!'));
  }

  /**
   * createDocumentFragment
   *  
   * @param {object} props - props from vanillapod component
   */

  function createDocumentFragment() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var fragment = document.createDocumentFragment();
    setElementProperties(fragment, props);
    setElementTextContent(fragment, props);
    setElementEventHandlers(fragment, props);
    return [fragment, props];
  }

  exports.createDocumentFragment = createDocumentFragment;
  exports.createElement = createElement;
  exports.debug = debug;
  exports.elementHelper = elementHelper;
  exports.mount = mount;
  exports.registerElement = registerElement;
  exports.registerHook = registerHook;
  exports.registerHooks = registerHooks;
  exports.setElementAttributes = setElementAttributes;
  exports.setElementChildren = setElementChildren;
  exports.setElementEventHandlers = setElementEventHandlers;
  exports.setElementProperties = setElementProperties;
  exports.setElementTextContent = setElementTextContent;
  exports.triggerHook = triggerHook;
  exports.unmount = unmount;
  exports.version = version;

  return exports;

}({}));
