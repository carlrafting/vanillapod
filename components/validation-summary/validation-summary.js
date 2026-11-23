/**
 * Replaces native validation bubbles on every `.validated-form` under `root`
 * with a summary of links to the invalid fields.
 *
 * @param {ParentNode} [root]
 */
export function initValidationSummaries(root = document) {
  for (const form of root.querySelectorAll(".validated-form")) {
    const summary = form.querySelector(".validation-summary");
    const list = summary.querySelector("ul");
    form.addEventListener("submit", (event) => {
      list.replaceChildren();
      const invalid = [...form.elements].filter((el) =>
        el.willValidate && !el.checkValidity()
      );
      for (const el of form.elements) el.removeAttribute("aria-invalid");
      if (invalid.length === 0) {
        summary.hidden = true;
        return;
      }
      event.preventDefault();
      for (const el of invalid) {
        el.setAttribute("aria-invalid", "true");
        const label =
          form.querySelector(`label[for="${el.id}"]`)?.textContent ?? el.name;
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${el.id}`;
        link.textContent = `${label}: ${el.validationMessage}`;
        link.addEventListener("click", (e) => {
          e.preventDefault();
          el.focus();
        });
        item.append(link);
        list.append(item);
      }
      summary.hidden = false;
      summary.focus();
    });
  }
}
