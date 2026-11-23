const anchorSupported = CSS.supports("anchor-name: --tooltip");

/** Fallback for browsers without CSS anchor positioning. */
function place(trigger, tip) {
  const offset =
    parseFloat(getComputedStyle(tip).getPropertyValue("--tooltip-offset")) *
      parseFloat(getComputedStyle(tip).fontSize) || 6;
  const a = trigger.getBoundingClientRect();
  const t = tip.getBoundingClientRect();
  const placement = tip.dataset.placement ?? "top";
  let top = placement === "bottom"
    ? a.bottom + offset
    : placement === "top"
    ? a.top - t.height - offset
    : a.top + (a.height - t.height) / 2;
  let left = placement === "left"
    ? a.left - t.width - offset
    : placement === "right"
    ? a.right + offset
    : a.left + (a.width - t.width) / 2;
  if (placement === "top" && top < 0) top = a.bottom + offset;
  left = Math.min(Math.max(left, 0), innerWidth - t.width);
  tip.style.top = `${top}px`;
  tip.style.left = `${left}px`;
}

/**
 * Shows the popover named by `data-tooltip` on hover or focus of each trigger.
 *
 * @param {ParentNode} [root]
 */
export function initTooltips(root = document) {
  for (const trigger of root.querySelectorAll("[data-tooltip]")) {
    const tip = document.getElementById(trigger.dataset.tooltip);
    const show = () => {
      if (tip.matches(":popover-open")) return;
      tip.showPopover();
      if (!anchorSupported) place(trigger, tip);
    };
    const hide = () => tip.matches(":popover-open") && tip.hidePopover();
    trigger.addEventListener("mouseenter", show);
    trigger.addEventListener("focus", show);
    trigger.addEventListener("mouseleave", hide);
    trigger.addEventListener("blur", hide);
    trigger.addEventListener("keydown", (e) => e.key === "Escape" && hide());
  }
}
