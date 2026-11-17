// @ts-self-types="./attributes.d.ts"
import debug from "./debug.js";

/** @import { ElementProps } from "./element.js" */

/**
 * setElementAttributes
 *
 * @param {HTMLElement} element - HTMLElement to set attributes on
 * @param {ElementProps} attributes - uses `attributes` / `attrs`, `classList` / `classNames` and `data`
 * @returns {void}
 */
export default function setElementAttributes(
  element,
  { attributes, attrs, classList, classNames, data },
) {
  debug() && console.log(`Setting attributes for ${element}`);

  const classes = classList || classNames;
  if (classes) {
    for (const className of classes) {
      element.classList.add(className);
    }
  }

  if (data) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        element.dataset[key] = /** @type {string} */ (data[key]);
      }
    }
  }

  attrs = attrs || attributes;
  if (attrs) {
    if (typeof attrs === "function") {
      const attrsObj = attrs();
      setElementAttributes(element, { ...attrsObj });
      return;
    }

    if (typeof attrs === "object") {
      debug() && console.log(attrs);
      for (const key in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, key)) {
          // NOTE: the following if statement prevents from setting for example a 'for' attribute
          // the reason is most likely because we are checking for a property
          // on the element object and not a html attribute
          // if (key in element) {
          element.setAttribute(key, attrs[key]);
          // }
        }
      }
      return;
    }

    for (
      const attribute
        of /** @type {Iterable<string>} */ (/** @type {unknown} */ (attrs))
    ) {
      element.setAttribute(attribute, "");
    }
  }
}
