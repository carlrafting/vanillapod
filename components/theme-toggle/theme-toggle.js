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
    if (theme) this.target.setAttribute("data-theme", theme);
    this.removeAttribute("loading");
    this.setAttribute("loaded", "");
  }
  handleEvent(event) {
    const theme = event.target.value;
    this.target.setAttribute("data-theme", theme);
    this.value = theme;
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
    if (name === "enable") {
      this.enable = true;
    }
    if (name === "target") {
      const target = document.querySelector(this.getAttribute("target"));
      this.target = target;
    }
    if (name === "autodetect") {
      this.autodetect = true;
    }
    if (name === "loading") {
      this.loading = true;
    }
    if (name === "loaded") {
      this.loading = false;
      this.loaded = true;
    }
    if (name === "store") {
      this.store.type = next.toLowerCase();
    }
  }
}
