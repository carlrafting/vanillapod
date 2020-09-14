export default function setElementTextContent(element, { text }) {
    if (text && text !== '') {
        element.appendChild(
            document.createTextNode(text)
        );
    }
}