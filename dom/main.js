const vanillapod = (superClass) => class extends superClass {
  static observedAttributes = ["size", "template"];
  template = null;
  size = null;
  constructor() {
    super();
    console.log("vanillapod", "super");
    this.hasSizes = !!this.sizes;
  }
  connectedCallback() {
    console.log("vanillapod", "connectedCallback"); 
  }
  attributeChangedCallback(name, prev, next) {
    console.log("vanillapod", "attributeChangedCallback", {name, prev, next});
    if (name === "size") {
      const size = this.sizes.includes(next);
      console.log({ size });
    }
    if (name === "template") {
      this.template = next;
      this.importNode();
    }
  }
  importNode() {
    const template = document.querySelector(`#${this.template}`);
    this.append(document.importNode(template.content, true));
  }
}
class VanillapodComponent extends vanillapod(HTMLElement) {
  sizes = ["small", "medium", "large"];
}
class FooBar extends VanillapodComponent {}
customElements.define("vanillapod-component", VanillapodComponent);
customElements.define("foo-bar", FooBar);