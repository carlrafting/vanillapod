/**
 * vanillapod.js 
 * v0.11.0 
 */
var vanillapod = (function (exports) {
  'use strict';

  var version = "0.11.0";

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
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
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
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
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

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
      if (exception) {
        throw exception;
      }
    }
    errors.push({
      exception: exception
    });
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

  // const defaultHooks = {};

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
            setElementAttributes(element, _key);
            // return;
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
        on = events;
        // reset events object since we're using `on` instead... 
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
   * @param {object} props - props from vanillapod component instance
   */
  function createElement(props) {
    debug() && console.log("Creating ".concat(props.element || props.el, " for ").concat(props.vanillapodComponent));
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
        return error(new Error("element is ".concat(element)));
      }
      return [element, props];
    }
    return error(new Error("No element specified on ".concat(props)));
  }

  /** 
   * registerElement
   * 
   * register a new vanillapodComponent instance 
   * 
   * TODO: should this be called createComponentInstance or something similar? refactor to separate file?
   * 
   * @param {function} vanillapodComponent - function for vanillapod component
   */
  function registerElement(vanillapodComponent, vanillapodComponentProps) {
    if (typeof vanillapodComponent === 'function') {
      debug() && console.log("Registering ".concat(vanillapodComponent, "..."));
      var props = vanillapodComponentProps ? vanillapodComponent(vanillapodComponentProps) : vanillapodComponent();
      if (_typeof(props) !== 'object' || props === undefined) {
        return error(new Error("".concat(vanillapodComponent, " must return an object")));
      }
      if (validateProps(props)) {
        return _objectSpread2({
          vanillapodComponent: vanillapodComponent
        }, props);
      }
    }
    return error(new Error("".concat(vanillapodComponent, " is not a function")));
  }

  /**
   * elementHelper
   * 
   * a helper responsible for creating DOM elements and setting attributes, 
   * properties, text content & event handlers.
   * 
   * @param {object} props - props from vanillapod component 
   */
  function elementHelper(props) {
    var _createElement = createElement(props),
      _createElement2 = _slicedToArray(_createElement, 2),
      element = _createElement2[0],
      elProps = _createElement2[1];
    debug() && console.log('elementHelper: elProps', elProps);

    // set element properties
    setElementProperties(element, elProps);

    // set attributes on elements
    setElementAttributes(element, elProps);

    // set textContent for element
    setElementTextContent(element, elProps);

    // register DOM event handlers
    setElementEventHandlers(element, elProps);
    return element;
  }

  /**
   * mount
   * 
   * @param {HTMLElement} root - parent element to mount elements to
   * @param {*} args - components to mount
   */
  function mount(root) {
    var _arguments = arguments;
    var index = 0;
    var vanillapodComponent;
    var props = {};
    var argsLength = arguments.length <= 1 ? 0 : arguments.length - 1;
    var _loop = function _loop() {
      var _arg, _arg2;
      var arg = index + 1 < 1 || _arguments.length <= index + 1 ? undefined : _arguments[index + 1];
      checkType(arg) === 'array' && (_arg = arg, _arg2 = _slicedToArray(_arg, 2), vanillapodComponent = _arg2[0], props = _arg2[1], _arg);
      checkType(arg) === 'function' && (vanillapodComponent = arg);
      checkType(arg) === 'object' && (vanillapodComponent = function vanillapodComponent() {
        return arg;
      });
      if (!vanillapodComponent) {
        return {
          v: error(new Error('Could not determine component format'))
        };
      }
      var instance = registerElement(vanillapodComponent, props);
      if (!instance) {
        return {
          v: error(new Error("Could not create instance for ".concat(vanillapodComponent)))
        };
      }
      var el = instance.el,
        element = instance.element;
      if (!el) {
        el = element;
        element = null;
        // delete instance.element;
      }

      // if el is a string, use implicit render approach
      if (checkType(el) === 'string') {
        el = elementHelper(instance);
      }
      if (instance.children && instance.children.length > 0) {
        mount.apply(void 0, [el].concat(_toConsumableArray(instance.children)));
      }
      registerHooks(el, instance);
      var hooks = el._vanillapod_hooks;

      // trigger children before hooks
      // triggerChildrenHooks(el, 'before');

      // trigger element before hook
      if (hooks && hooks.before) {
        triggerHook(el, 'before');
      }

      // mount element to root
      if (root) {
        root.insertBefore(el, null);
      }

      // mount element to document body
      if (!root && document.body) {
        document.body.insertBefore(el, document.body.lastChild);
      }

      // trigger element mount hook
      if (hooks && hooks.mount) {
        triggerHook(el, 'mount');
      }

      // trigger children mount hooks
      // triggerChildrenHooks(el, 'mount');
    };
    for (; index < argsLength; index += 1) {
      var _ret = _loop();
      if (_typeof(_ret) === "object") return _ret.v;
    }
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
  exports.errors = errors;
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
  exports.version = version;

  return exports;

})({});
