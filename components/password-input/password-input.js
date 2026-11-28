/** Elements this module has already enhanced. */
const enhanced = new WeakSet();

/**
 * Adds a show/hide toggle to every `.password-input` under `root`.
 *
 * Safe to call again, for example after inserting markup: elements that were
 * already enhanced are skipped, so a second call adds nothing to them.
 *
 * @param {ParentNode} [root] where to look, defaults to the document
 * @param {string} [selector] CSS selector for the elements to enhance
 */
export function initPasswordInputs(
  root = document,
  selector = ".password-input",
) {
  for (const el of root.querySelectorAll(selector)) {
    if (enhanced.has(el)) continue;
    const input = el.querySelector("input");
    const button = el.querySelector("button");
    button.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Hide password" : "Show password";
    });
    enhanced.add(el);
  }
}
