/**
 * Adds a show/hide toggle to every `.password-input` under `root`.
 *
 * @param {ParentNode} [root] where to look, defaults to the document
 * @param {string} [selector] CSS selector for the elements to enhance
 */
export function initPasswordInputs(
  root = document,
  selector = ".password-input",
) {
  for (const el of root.querySelectorAll(selector)) {
    const input = el.querySelector("input");
    const button = el.querySelector("button");
    button.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Hide password" : "Show password";
    });
  }
}
