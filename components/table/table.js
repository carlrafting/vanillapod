/**
 * Makes every `.table` under `root` sortable through the buttons inside its
 * `th[aria-sort]` headers.
 *
 * @param {ParentNode} [root]
 */
export function initTables(root = document) {
  for (const table of root.querySelectorAll(".table")) {
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
  }
}
