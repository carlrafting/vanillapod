/**
 * setElementTextContent
 * 
 * @param {HTMLElement} element - element to set text content on
 * @param {string} text - text content for element 
 */
export default function setElementTextContent(element, { text }) {
    if (text && text !== '') {
        element.appendChild(
            document.createTextNode(text)
        );
    }
}
