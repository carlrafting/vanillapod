/** Elements this module has already enhanced. */
const enhanced = new WeakSet();

/**
 * Makes every `.table` under `root` sortable through the buttons inside its
 * `th[aria-sort]` headers.
 *
 * Safe to call again, for example after inserting markup: elements that were
 * already enhanced are skipped, so a second call adds nothing to them.
 *
 * @param {ParentNode} [root] where to look, defaults to the document
 * @param {string} [selector] CSS selector for the elements to enhance
 */
export function initTables(root = document, selector = ".table") {
  for (const table of root.querySelectorAll(selector)) {
    if (enhanced.has(table)) continue;
    const headers = [...table.querySelectorAll("th[aria-sort]")];
    headers.forEach((th, index) => {
      th.querySelector("button").addEventListener("click", () => {
        const asc = th.getAttribute("aria-sort") !== "ascending";
        for (const h of headers) h.setAttribute("aria-sort", "none");
        th.setAttribute("aria-sort", asc ? "ascending" : "descending");
        const body = table.tBodies[0];
        const rows = [...body.rows].sort((a, b) =>
          a.cells[index].textContent.localeCompare(
            b.cells[index].textContent,
            undefined,
            { numeric: true },
          ) * (asc ? 1 : -1)
        );
        body.append(...rows);
      });
    });
    enhanced.add(table);
  }
}
