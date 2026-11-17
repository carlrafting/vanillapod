import { normalizeEvent } from "../../dom/src/events.js";

/**
 * @param {EventTarget} element
 * @param {{ events?: Record<string, EventListener>, on?: Record<string, EventListener> }} handlers
 */
export default function setElementEventHandlers(element, { events, on }) {
  // `on` takes precedence over `events` when both are given.
  const handlers = on || events;
  if (handlers) {
    for (const event of Object.keys(handlers)) {
      element.addEventListener(normalizeEvent(event), handlers[event], false);
    }
  }
}
