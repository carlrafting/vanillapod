export { version } from './package.json';
import mount from './src/mount';
import debug from './src/debug';
import setElementProperties from './src/properties';
import setElementAttributes from './src/attributes';
import setElementTextContent from './src/text';
import setElementEventHandlers from './src/events';
import createDocumentFragment from './src/fragment';

export * from './src/dom';
export * from './src/memo';
export * from './src/state';
export * from './src/error';
export * from './src/element';
export * from './src/hooks';
export {
    mount,
    debug,
    setElementProperties,
    setElementAttributes,
    setElementTextContent,
    setElementEventHandlers,
    createDocumentFragment,
};
