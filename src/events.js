function normalizeEvent(event = '') {
    const sliceStart = 2;
    const indexOfStart = 0;
    let normalizedEvent;
    if (event.indexOf('on') === indexOfStart) {
        normalizedEvent = event.slice(sliceStart);
        return (normalizedEvent = normalizedEvent.toLowerCase());
    }
    return event.toLowerCase();
}

export default function setElementEventHandlers(element, { events, on }) {
    if (on || events) {
        if (!on) {
            on = events;
            // reset events object since we're using `on` instead...
            events = {};
        }
        for (const event of Object.keys(on)) {
            const normalizedEventName = `${normalizeEvent(event)}`;
            element.addEventListener(normalizedEventName, on[event], false);
        }
    }
}
