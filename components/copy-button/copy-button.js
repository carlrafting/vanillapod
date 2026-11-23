/**
 * Wires up every `[data-copy-target]` button under `root` to copy the text of
 * the element it points at, reporting the result in the next sibling element.
 *
 * @param {ParentNode} [root]
 */
export function initCopyButtons(root = document) {
  for (const button of root.querySelectorAll("[data-copy-target]")) {
    button.addEventListener("click", async () => {
      const text = document.getElementById(button.dataset.copyTarget)
        .textContent;
      const status = button.nextElementSibling;
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = "Copied!";
      } catch {
        status.textContent = "Copy failed";
      }
      setTimeout(() => (status.textContent = ""), 2000);
    });
  }
}
