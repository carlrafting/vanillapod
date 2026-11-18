import { CodeJar } from "./vendor/codejar.js";
import { defaultExample, examples } from "./examples.js";

const SOURCES = {
  vanillapod: "../dom/main.js",
  "vp/dom": "../dom/src/dom.js",
  "vp/state": "../dom/src/state.js",
  "vp/utils": "../dom/src/utils.js",
  "vp/events": "../dom/src/events.js",
};

const encode = (code) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(code)));
const decode = (b64) =>
  new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

/**
 * Library modules as data: URLs so the iframe can stay fully sandboxed
 * (no same-origin access, so shared links can't touch the docs site).
 * Built once and shared by every playground on the page.
 */
let importMapPromise;
function loadImportMap() {
  importMapPromise ??= (async () => {
    const imports = {};
    for (const [name, path] of Object.entries(SOURCES)) {
      const response = await fetch(new URL(path, import.meta.url));
      if (!response.ok) throw new Error(`Could not load ${path}`);
      const source = (await response.text()).replace(
        /(from\s+)["']\.\/(?:src\/)?(\w+)\.js["']/g,
        (_, from, file) => `${from}"vp/${file}"`,
      );
      imports[name] = `data:text/javascript;base64,${encode(source)}`;
    }
    return JSON.stringify({ imports }).replaceAll("<", "\\u003c");
  })();
  return importMapPromise;
}

const bridge = `
const send = (level, args) => parent.postMessage({ pg: true, level, args: args.map(format) }, "*");
function format(value) {
  if (value instanceof Error) return value.name + ": " + value.message;
  if (typeof value === "string") return value;
  try { return JSON.stringify(value, null, 2) ?? String(value); } catch { return String(value); }
}
for (const level of ["log", "info", "warn", "error"]) {
  const original = console[level];
  console[level] = (...args) => { original.apply(console, args); send(level, args); };
}
addEventListener("error", (e) => send("error", [e.error ?? e.message]));
addEventListener("unhandledrejection", (e) => send("error", [e.reason]));
`;

const frameStyles =
  "body{font-family:system-ui,sans-serif;margin:1rem;line-height:1.5}button{margin-inline-end:.5rem}";

let instances = 0;

/**
 * `<vp-playground>`: an editor, sandboxed live preview and console.
 *
 * Light DOM only (no shadow root), so page CSS and Prism's theme apply as-is.
 *
 * Attributes:
 * - `example`: name of the example to start with (see examples.js)
 * - `share`: sync code with the URL `#code=` hash and show "Copy share link"
 *   (use on one playground per page)
 */
export class Playground extends HTMLElement {
  static get tagName() {
    return "vp-playground";
  }

  #jar = null;
  #timer = 0;
  #escaped = false;
  #parts = {};
  #onMessage = (event) => this.#handleMessage(event);
  #onHashChange = () => this.#loadFromHash();

  get #shared() {
    return this.hasAttribute("share");
  }

  connectedCallback() {
    const id = `vp-playground-${++instances}`;
    this.innerHTML = `
      <div class="pg-toolbar" role="toolbar" aria-label="Playground controls">
        <label>Example <select data-part="example"></select></label>
        <button type="button" data-part="run">Run <kbd>Ctrl</kbd>+<kbd>Enter</kbd></button>
        <label class="pg-auto">
          <input type="checkbox" data-part="auto" checked> Run as I type
        </label>
        <button type="button" data-part="share" hidden>Copy share link</button>
        <button type="button" data-part="reset">Reset</button>
        <span class="pg-status" data-part="status" role="status" aria-live="polite"></span>
      </div>
      <div class="pg-panes">
        <section class="pg-pane" aria-labelledby="${id}-code">
          <h2 id="${id}-code">Code</h2>
          <pre class="pg-editor language-javascript" data-part="editor" role="textbox"
            aria-multiline="true" aria-label="Code editor" tabindex="0"></pre>
          <p class="pg-hint">
            Import from <code>"vanillapod"</code>. Render into <code>#app</code>.
            <kbd>Tab</kbd> indents, <kbd>Esc</kbd> then <kbd>Tab</kbd> moves focus.
          </p>
        </section>
        <section class="pg-pane" aria-labelledby="${id}-preview">
          <h2 id="${id}-preview">Preview</h2>
          <iframe class="pg-preview" data-part="preview" title="Playground preview"
            sandbox="allow-scripts allow-forms"></iframe>
          <h2 id="${id}-console">Console</h2>
          <ol class="pg-console" data-part="console" aria-labelledby="${id}-console"
            aria-live="polite"></ol>
        </section>
      </div>`;

    for (const el of this.querySelectorAll("[data-part]")) {
      this.#parts[el.dataset.part] = el;
    }
    const { editor, example, run, share, reset, auto } = this.#parts;

    for (const name of Object.keys(examples)) {
      example.append(new Option(name, name));
    }
    example.addEventListener("change", () => this.#loadExample(example.value));
    run.addEventListener("click", () => this.run());
    reset.addEventListener("click", () => this.#loadExample(example.value));
    share.hidden = !this.#shared;
    share.addEventListener("click", () => this.#copyShareLink());

    // Registered before CodeJar so it sees keys first: after Escape, let Tab
    // leave the editor instead of inserting a tab (keyboard-trap escape hatch).
    editor.addEventListener("keydown", (event) => {
      if (event.key === "Tab" && this.#escaped) {
        event.stopImmediatePropagation();
      } else if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        this.run();
      }
      this.#escaped = event.key === "Escape";
    });
    editor.addEventListener("blur", () => (this.#escaped = false));

    this.#jar = CodeJar(
      editor,
      (el) => Prism.highlightElement(el),
      { tab: "  ", addClosing: false },
    );
    this.#jar.onUpdate(() => this.#schedule(auto));

    // Registered after CodeJar. CodeJar handles Enter itself only when it has
    // indentation to carry over; otherwise it leaves it to the browser, and
    // Chromium's contenteditable="plaintext-only" then inserts a <br>, which
    // textContent (and so CodeJar) never sees: the newline is lost on the next
    // highlight. Insert a real "\n" whenever CodeJar didn't. Only insertHTML
    // gives a real "\n" here (insertText and insertLineBreak give a <br>).
    editor.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.key !== "Enter") return;
      if (event.shiftKey || event.altKey || event.isComposing) return;
      event.preventDefault();
      const selection = getSelection();
      // A lone "\n" at the very end isn't a visible line, so typing would eat
      // it. Insert two and put the caret between them, like CodeJar's own
      // legacy mode does. Browsers differ on where the caret lands, so set it.
      const offset = this.#caretOffset(editor);
      if (selection.isCollapsed && offset === this.#jar.toString().length) {
        document.execCommand("insertHTML", false, "\n\n");
        this.#setCaretOffset(editor, offset + 1);
      } else {
        document.execCommand("insertHTML", false, "\n");
      }
    });

    addEventListener("message", this.#onMessage);
    if (this.#shared) addEventListener("hashchange", this.#onHashChange);

    if (!(this.#shared && this.#loadFromHash())) {
      const wanted = this.getAttribute("example");
      this.#loadExample(wanted in examples ? wanted : defaultExample);
    }
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
    this.#jar?.destroy();
    this.#jar = null;
    removeEventListener("message", this.#onMessage);
    removeEventListener("hashchange", this.#onHashChange);
  }

  async run() {
    const { preview, console: output } = this.#parts;
    const importMap = await loadImportMap();
    output.replaceChildren();
    this.#setStatus("");
    const code = this.#jar.toString().replaceAll("</script", "<\\/script");
    preview.srcdoc = `<!doctype html><meta charset="utf-8">
<style>${frameStyles}</style>
<script type="importmap">${importMap}</script>
<script>${bridge}</script>
<div id="app"></div>
<script type="module">${code}</script>`;
  }

  /** Caret position as a character offset into the editor's text. */
  #caretOffset(editor) {
    const selection = getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.setEnd(selection.focusNode, selection.focusOffset);
    return range.toString().length;
  }

  /** Places a collapsed caret at a character offset into the editor's text. */
  #setCaretOffset(editor, offset) {
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (offset <= node.length) {
        const range = document.createRange();
        range.setStart(node, offset);
        range.collapse(true);
        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
      offset -= node.length;
    }
  }

  #handleMessage(event) {
    const { preview, console: output } = this.#parts;
    if (event.source !== preview.contentWindow || !event.data?.pg) return;
    const li = document.createElement("li");
    li.dataset.level = event.data.level;
    li.textContent = event.data.args.join(" ");
    output.append(li);
    output.scrollTop = output.scrollHeight;
    if (event.data.level === "error") this.#setStatus("Error — see console", true);
  }

  #setStatus(message, isError = false) {
    const { status } = this.#parts;
    status.textContent = message;
    status.toggleAttribute("data-error", isError);
  }

  #schedule(auto) {
    if (!auto.checked) return;
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.run(), 500);
  }

  #loadExample(name) {
    this.#jar.updateCode(examples[name], false);
    this.#parts.example.value = name;
    if (this.#shared) history.replaceState(null, "", location.pathname);
    this.run();
  }

  #loadFromHash() {
    const shared = new URLSearchParams(location.hash.slice(1)).get("code");
    if (!shared) return false;
    try {
      this.#jar.updateCode(decode(shared), false);
      this.#parts.example.value = "";
    } catch {
      return false;
    }
    this.run();
    return true;
  }

  async #copyShareLink() {
    const url = `${location.origin}${location.pathname}#code=${
      encode(this.#jar.toString())
    }`;
    history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      this.#setStatus("Link copied");
    } catch {
      this.#setStatus("Link is in the address bar");
    }
  }
}

customElements.define(Playground.tagName, Playground);
