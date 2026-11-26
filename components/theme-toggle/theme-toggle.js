export class ThemeToggle extends HTMLElement {
  static get tagName() {
    return "theme-toggle";
  }
  static get observedAttributes() {
    return ["target", "enable", "store", "loading", "loaded", "autodetect"];
  }
  supportedThemes = [];
  enable = false;
  autodetect = false;
  loading = false;
  loaded = false;
  target = null;
  targetDataAttrValue;
  store = {
    type: null,
    key: "theme",
    value: null,
  };
  connectedCallback() {
    this.setAttribute("loading", "");
    // console.log("theme-toggle connected!");
    // console.log(this.supportedThemes);
    if (this.autodetect) {
      this.getSupportedThemes();
    }
    if (this.enable) {
      this.enableFormElements();
    }
    this.updateCheckedState();
    this.addEventListener("change", this);
    const theme = this.value;
    if (theme) this.themeTarget.setAttribute("data-theme", theme);
    this.removeAttribute("loading");
    this.setAttribute("loaded", "");
  }
  handleEvent(event) {
    const theme = event.target.value;
    this.themeTarget.setAttribute("data-theme", theme);
    this.value = theme;
  }
  /** The element that gets `data-theme`, the document root by default. */
  get themeTarget() {
    return this.target ?? document.documentElement;
  }
  getDisabledElements() {
    const selector = "[disabled]";
    return this.querySelectorAll(selector);
  }
  get disabled() {
    const disabled = this.getDisabledElements();
    // console.log(disabled);
    return disabled.length > 0;
  }
  set value(newValue) {
    if (this.store.type === "localstorage") {
      localStorage.setItem(this.store.key, newValue);
    }
  }
  get value() {
    if (this.store.type === "localstorage") {
      const stored = localStorage.getItem(this.store.key);
      if (stored) return stored;
    }
    return null;
  }
  enableFormElements() {
    if (this.disabled) {
      const disabledElements = [...this.getDisabledElements()];
      for (const element of disabledElements) {
        element.disabled = false;
      }
    }
  }
  updateCheckedState() {
    const theme = this.value;
    if (!theme) return;
    for (const radio of this.querySelectorAll("input[type=radio]")) {
      radio.checked = radio.value === theme;
    }
  }
  getSupportedThemes(from = this.querySelectorAll("fieldset>menu>li>input")) {
    const results = [];
    for (const field of from) {
      // console.log({ field });
      if (!field) continue;
      const lowercaseNodeName = field.nodeName.toLowerCase();
      const typeAttr = field?.type;
      const name = field?.name;
      const value = field?.value;
      if (lowercaseNodeName === "input" && typeAttr === "radio") {
        results.push({
          name,
          value,
        });
      }
    }
    // console.log({ results });
    this.supportedThemes = results;
  }
  attributeChangedCallback(name, prev, next) {
    // console.log(`"${name}" changed from "${prev}" to "${next}"`);
    const present = next !== null;
    if (name === "enable") {
      this.enable = present;
    }
    if (name === "target") {
      this.target = present ? document.querySelector(next) : null;
    }
    if (name === "autodetect") {
      this.autodetect = present;
    }
    if (name === "loading") {
      this.loading = present;
    }
    if (name === "loaded") {
      if (present) this.loading = false;
      this.loaded = present;
    }
    if (name === "store") {
      this.store.type = present ? next.toLowerCase() : null;
    }
  }
}
