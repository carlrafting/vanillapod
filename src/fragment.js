import setElementProperties from './properties.js';
import setElementEventHandlers from './events.js';
import setElementTextContent from './text.js';

export default function createDocumentFragment(props = {}) {
    const fragment = document.createDocumentFragment();

    setElementProperties(fragment, props);
    setElementTextContent(fragment, props);
    setElementEventHandlers(fragment, props);

    return [fragment, props];
}
