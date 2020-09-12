export default function attachChildren([element, children]) {
    console.log('Attaching children to element...')
    if (children) {
        children.forEach(child => element.appendChild(child));
    }
    console.log('Attached children to element ', element);

    return element;
}
