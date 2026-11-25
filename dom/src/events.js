export function normalizeEvent(event = "") {
  const sliceStart = 2;
  const indexOfStart = 0;
  let normalizedEvent;
  if (event.indexOf("on") === indexOfStart) {
    normalizedEvent = event.slice(sliceStart);
    return (normalizedEvent = normalizedEvent.toLowerCase());
  }
  return event.toLowerCase();
}
