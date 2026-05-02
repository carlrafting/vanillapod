customElements.define(
  "theme-toggle",
  class extends Node {
    constructor() {
      super();
      console.log("theme-toggle constructed!");
    }
    connectedCallback() {
      console.log("theme-toggle connected!");
    }
  },
);
