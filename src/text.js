// @ts-self-types="./text.d.ts"
/** @import { ElementProps } from "./element.js" */

/**
 * setElementTextContent
 *
 * @param {Node} element - node to set text content on
 * @param {ElementProps} props - uses `text`
 * @returns {void}
 */
export default function setElementTextContent(element, { text }) {
  if (text && text !== "") {
    const textNode = document.createTextNode(String(text));
    element.textContent = textNode.data;
  }
}
