import setElementEventHandlers from "./events.js";

/**
 * @param {Record<string, any>} [props]
 */
export default function createDocumentFragment(props = {}) {
  const fragment = document.createDocumentFragment();

  const values = props.props || props.properties;
  if (values) {
    for (const key of Object.keys(values)) {
      /** @type {any} */ (fragment)[key] = values[key];
    }
  }
  if (props.text && props.text !== "") {
    fragment.textContent = props.text;
  }
  setElementEventHandlers(fragment, props);

  return [fragment, props];
}
