// export { version } from './package.json';

export const version = "0.11.2";

// legacy
export { createElement } from './src/element.js';
export { default as mount } from './src/mount.js';
export * from './src/hooks.js';
export { default as setElementProperties } from './src/properties.js';
export { default as setElementAttributes } from './src/attributes.js';
export { default as setElementTextContent } from './src/text.js';
export { default as setElementEventHandlers } from './src/events.js';
export { default as createDocumentFragment } from './src/fragment.js';

// new api exports
export { default as debug } from './src/debug.js';
export * from './src/dom.js';
export * from './src/state.js';
export * from './src/error.js';
export * from './src/element.js';
