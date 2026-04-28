const dom = new Map();
const elements = new Set([
  // 1. Content Sectioning
  "address",
  "article",
  "aside",
  "footer",
  "header",
  "main",
  "nav",
  "section",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  // 2. Text Content
  "div",
  "p",
  "blockquote",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "figure",
  "figcaption",
  "hr",
  "menu",
  "pre",
  // 3. Inline Text Semantics
  "span",
  "br",
  // 4. Image And Multimedia
  // 5. Embedded content
  // 6. SVG
  // 7. Demarcating Edits
  // 8. Table Content
  // 9. Forms
  "form",
  "fieldset",
  "label",
  "input",
  "textarea",
  "button",
  "select",
  "option",
  // 10. Interactive Elements
  // 11. Web Components
]);
function cleanupElements() {
  if (dom.size > 0) {
    for (const el of elements) {
      elements.delete(el);
    }
    return elements.clear();
  }
}
function createDOMMap(done = null) {
  // const memo = createMemo((fn, ...params) => fn(...params));
  for (const el of elements) {
    const fn = (...params) => {
      const createElement = createMountable(el, true);
      // return memo(fn, ...params);
      return createElement(...params);
    };
    dom.set(el, fn);
  }
  console.log({ dom });
  if (done && typeof done === "function") {
    done();
  }
}
const el = (
  /** @type {string} */ el
) => (
  /** @type {any} */ ...params
) => dom.get(el)(...params);

export const div = el("div");
export const p = el("p");
export const h1 = el("h1");
export const h2 = el("h2");
export const h3 = el("h3");
export const h4 = el("h4");
export const h5 = el("h5");
export const h6 = el("h6");
export const hr = el("hr");
export const article = el("article");
export const aside = el("aside");
export const footer = el("footer");
export const header = el("header");
export const main = el("main");
export const nav = el("nav");
export const section = el("section");
export const ul = el("ul");
export const ol = el("ol");
export const li = el("li");
export const dl = el("dl");
export const dt = el("dt");
export const dd = el("dd");
export const form = el("form");
export const fieldset = el("fieldset");
export const label = el("label");
export const input = el("input");
export const textarea = el("textarea");
export const button = el("button");
export const select = el("select");
export const option = el("option");
export const span = el("span");
export const br = el("br");

export const fragment = (
  /** @type {unknown[]} */ ...params
) => createMountable(null, false)(...params);
export const text = (
  /** @type {string} */ text
) => document.createTextNode(text);
export const comment = (
  /** @type {string} */ text
) => document.createComment(text);

