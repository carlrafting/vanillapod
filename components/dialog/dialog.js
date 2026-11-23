/**
 * Opens the `<dialog>` named by `data-dialog-open` when its button is clicked.
 *
 * @param {ParentNode} [root] where to look, defaults to the document
 * @param {string} [selector] CSS selector for the elements to enhance
 */
export function initDialogs(root = document, selector = "[data-dialog-open]") {
  for (const button of root.querySelectorAll(selector)) {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.dialogOpen)?.showModal();
    });
  }
}
