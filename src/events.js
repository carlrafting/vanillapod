// @ts-self-types="./events.d.ts"
/** @import { ElementProps } from "./element.js" */

/**
 * @param {string} [event]
 * @returns {string}
 */
function normalizeEvent(event = "") {
  const sliceStart = 2;
  const indexOfStart = 0;
  let normalizedEvent;
  if (event.indexOf("on") === indexOfStart) {
    normalizedEvent = event.slice(sliceStart);
    return (normalizedEvent = normalizedEvent.toLowerCase());
  }
  return event.toLowerCase();
}

/**
 * setElementEventHandlers
 *
 * @param {EventTarget} element - target to add event listeners to
 * @param {ElementProps} props - uses `on` / `events`
 * @returns {void}
 */
export default function setElementEventHandlers(element, { events, on }) {
  on = on || events;
  if (on) {
    for (const event of Object.keys(on)) {
      const normalizedEventName = `${normalizeEvent(event)}`;
      element.addEventListener(normalizedEventName, on[event], false);
    }
  }
}
