/**
 * Opens the `<dialog>` named by `data-dialog-open` when its button is clicked.
 *
 * @param {ParentNode} [root]
 */
export function initDialogs(root = document) {
  for (const button of root.querySelectorAll("[data-dialog-open]")) {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.dialogOpen)?.showModal();
    });
  }
}
