/** Elements this module has already enhanced. */
const enhanced = new WeakSet();

/**
 * Wires up every `[data-copy-target]` button under `root` to copy the text of
 * the element it points at, reporting the result in the next sibling element.
 *
 * Safe to call again, for example after inserting markup: elements that were
 * already enhanced are skipped, so a second call adds nothing to them.
 *
 * @param {ParentNode} [root] where to look, defaults to the document
 * @param {string} [selector] CSS selector for the elements to enhance
 */
export function initCopyButtons(
  root = document,
  selector = "[data-copy-target]",
) {
  for (const button of root.querySelectorAll(selector)) {
    if (enhanced.has(button)) continue;
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
    enhanced.add(button);
  }
}
