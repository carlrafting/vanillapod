export default function setElementEventHandlers(element, { events = {} }) {
    if (events) {
        for (const event in events) {
            if (Object.prototype.hasOwnProperty.call(events, event)) {
                element.addEventListener(`${event}`, events[event], false);              
            }
        }
    }
}