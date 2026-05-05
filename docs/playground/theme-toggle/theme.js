export class ThemeToggle extends HTMLElement {
  static get tagName() {
    return "theme-toggle";
  }
  constructor() {
    super();
    console.log("theme-toggle constructed!");
    this.enable();
  }
  connectedCallback() {
    console.log("theme-toggle connected!");
    this.addEventListener("submit", (event) => {
      event.preventDefault();
      console.log(event);
    });
  }
  getDisabledElements() {
    const selector = "[disabled]";
    return this.querySelectorAll(selector);
  }
  get disabled() {
    const disabled = this.getDisabledElements();
    console.log(disabled);
    return disabled.length > 0;
  }
  enable() {
    if (this.disabled) {
      const disabledElements = [...this.getDisabledElements()];
      for (const element of disabledElements) {
        element.disabled = false;
      }
    }
  }
}
