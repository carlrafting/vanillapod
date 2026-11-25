import { a, enhance, li, render } from "@vanillapod/dom";

/**
 * Replaces native validation bubbles on every `.validated-form` under `root`
 * with a summary of links to the invalid fields.
 *
 * @param {ParentNode} [root] where to look, defaults to the document
 * @param {string} [selector] CSS selector for the elements to enhance
 */
export function initValidationSummaries(
  root = document,
  selector = ".validated-form",
) {
  for (const form of root.querySelectorAll(selector)) {
    const summary = form.querySelector(".validation-summary");
    const list = summary.querySelector("ul");
    enhance(form, {
      onsubmit: (event) => {
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
          enhance(el, { "aria-invalid": "true" });
          const label =
            form.querySelector(`label[for="${el.id}"]`)?.textContent ??
              el.name;
          render([
            li(
              a({
                href: `#${el.id}`,
                onclick: (e) => {
                  e.preventDefault();
                  el.focus();
                },
              }, `${label}: ${el.validationMessage}`),
            ),
          ], list);
        }
        summary.hidden = false;
        summary.focus();
      },
    });
  }
}
