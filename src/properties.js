// @ts-self-types="./properties.d.ts"
/** @import { ElementProps } from "./element.js" */

/**
 * setElementProperties
 *
 * @param {object} element - element (or fragment) to set properties on
 * @param {ElementProps} props - uses `props` / `properties`
 * @returns {void}
 */
export default function setElementProperties(element, { props, properties }) {
  props = props || properties;
  if (props) {
    for (const key of Object.keys(props)) {
      /** @type {Record<string, unknown>} */ (element)[key] = props[key];
    }
  }
}
