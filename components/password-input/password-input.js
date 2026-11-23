/**
 * Adds a show/hide toggle to every `.password-input` under `root`.
 *
 * @param {ParentNode} [root]
 */
export function initPasswordInputs(root = document) {
  for (const el of root.querySelectorAll(".password-input")) {
    const input = el.querySelector("input");
    const button = el.querySelector("button");
    button.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Hide password" : "Show password";
    });
  }
}
