export default function setElementTextContent(element, { text }) {
    if (text && text !== '') {
        text = document.createTextNode(text);
        element.textContent = text.data;
    }
}
