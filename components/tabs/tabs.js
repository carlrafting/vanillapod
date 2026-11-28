import { enhance } from "@vanillapod/dom";

/** Elements this module has already enhanced. */
const enhanced = new WeakSet();

/**
 * Adds selection and arrow/Home/End key navigation to every `.tabs` under
 * `root`.
 *
 * Safe to call again, for example after inserting markup: elements that were
 * already enhanced are skipped, so a second call adds nothing to them.
 *
 * @param {ParentNode} [root] where to look, defaults to the document
 * @param {string} [selector] CSS selector for the elements to enhance
 */
export function initTabs(root = document, selector = ".tabs") {
  for (const el of root.querySelectorAll(selector)) {
    if (enhanced.has(el)) continue;
    const tabs = [...el.querySelectorAll('[role="tab"]')];
    const select = (tab) => {
      for (const t of tabs) {
        const selected = t === tab;
        enhance(t, { "aria-selected": String(selected) });
        enhance(document.getElementById(t.getAttribute("aria-controls")), {
          hidden: !selected,
        });
      }
      tab.focus();
    };
    for (const tab of tabs) {
      enhance(tab, {
        onclick: () => select(tab),
        onkeydown: (event) => {
          const i = tabs.indexOf(tab);
          const next = {
            ArrowRight: tabs[(i + 1) % tabs.length],
            ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length],
            Home: tabs[0],
            End: tabs[tabs.length - 1],
          }[event.key];
          if (next) {
            event.preventDefault();
            select(next);
          }
        },
      });
    }
    enhanced.add(el);
  }
}
