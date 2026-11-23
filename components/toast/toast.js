/**
 * Adds a toast to a `.toasts` region. It removes itself after `timeout`
 * (paused while hovered), or when clicked or activated with Enter or Space.
 *
 * @param {string} message
 * @param {object} [options]
 * @param {string} [options.variant] info, success, warning or danger
 * @param {number} [options.timeout] milliseconds before it removes itself
 * @param {Element} [options.region] defaults to the first `.toasts` element
 */
export function showToast(
  message,
  {
    variant = "info",
    timeout = 4000,
    region = document.querySelector(".toasts"),
  } = {},
) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.tabIndex = 0;
  toast.dataset.variant = variant;
  toast.textContent = message;
  region.append(toast);

  const remove = () => {
    if (toast.dataset.leaving !== undefined) return;
    toast.dataset.leaving = "";
    const duration = Math.max(
      ...getComputedStyle(toast).transitionDuration.split(",").map((value) =>
        parseFloat(value) * (value.includes("ms") ? 1 : 1000)
      ),
    );
    if (!duration) return toast.remove();
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
    setTimeout(() => toast.remove(), duration + 50);
  };

  let timer;
  const start = () => (timer = setTimeout(remove, timeout));
  const pause = () => clearTimeout(timer);
  toast.addEventListener("mouseenter", pause);
  toast.addEventListener("mouseleave", start);
  toast.addEventListener("click", remove);
  toast.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      remove();
    }
  });
  start();
}
