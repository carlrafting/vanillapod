export { version } from './package.json';

// legacy
export { createElement } from './src/element';
export { default as mount } from './src/mount';
export * from './src/hooks';
export { default as setElementProperties } from './src/properties';
export { default as setElementAttributes } from './src/attributes';
export { default as setElementTextContent } from './src/text';
export { default as setElementEventHandlers } from './src/events';
export { default as createDocumentFragment } from './src/fragment';

// new api exports
export { default as debug } from './src/debug';
export * from './src/dom';
export * from './src/memo';
export * from './src/state';
export * from './src/error';
export * from './src/element';
export * from './src/hooks';
