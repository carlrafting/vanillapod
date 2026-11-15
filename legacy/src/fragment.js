import setElementEventHandlers from "./events.js";

export default function createDocumentFragment(props = {}) {
  const fragment = document.createDocumentFragment();

  const values = props.props || props.properties;
  if (values) {
    for (const key of Object.keys(values)) {
      fragment[key] = values[key];
    }
  }
  if (props.text && props.text !== "") {
    fragment.textContent = props.text;
  }
  setElementEventHandlers(fragment, props);

  return [fragment, props];
}
