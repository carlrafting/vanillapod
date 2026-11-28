/** Elements this module has already enhanced. */
const enhanced = new WeakSet();

/**
 * Opens the `<dialog>` named by `data-dialog-open` when its button is clicked.
 *
 * Safe to call again, for example after inserting markup: elements that were
 * already enhanced are skipped, so a second call adds nothing to them.
 *
 * @param {ParentNode} [root] where to look, defaults to the document
 * @param {string} [selector] CSS selector for the elements to enhance
 */
export function initDialogs(root = document, selector = "[data-dialog-open]") {
  for (const button of root.querySelectorAll(selector)) {
    if (enhanced.has(button)) continue;
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.dialogOpen)?.showModal();
    });
    enhanced.add(button);
  }
}
