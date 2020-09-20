import { setElementProperties } from './element.js';
import setElementEventHandlers from './events';
import setElementTextContent from './text';

export default function createDocumentFragment(props = {}) {
    const fragment = document.createDocumentFragment();

    setElementProperties(fragment, props);
    setElementTextContent(fragment, props);
    setElementEventHandlers(fragment, props);

    return [
        fragment,
        props
    ];
}
