import setElementProperties from './properties';
import setElementEventHandlers from './events';
import setElementTextContent from './text';

/**
 * createDocumentFragment
 *  
 * @param {object} props - props from vanillapod component
 */
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
