export const version = "0.11.2";

// legacy
export { createComponentInstance, default as mount } from "./src/mount.js";
export * from "./src/hooks.js";
export { default as setElementEventHandlers } from "./src/events.js";
export { default as createDocumentFragment } from "./src/fragment.js";

// new api exports
export * from "./src/dom.js";
export * from "./src/state.js";
