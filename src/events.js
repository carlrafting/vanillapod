/**
 * setElementEventHandlers
 * 
 * @param {HTMLElement} element - element to set event handlers on
 * @param {object} events - events to set on element 
 */
export default function setElementEventHandlers(element, { events, on }) {
    if (on || events) {
        if (!on) {
            on = events;
            // reset events object since we're using `on` instead... 
            events = {};
        }

        for (const event in on) {
            if (Object.prototype.hasOwnProperty.call(on, event)) {
                element.addEventListener(`${event}`, on[event], false);              
            }
        }
    }
}
