import { CodeJar } from "./vendor/codejar.js";

const SOURCES = {
  "vp/dom": "../dom/main.js",
  "vp/state": "../state/main.js",
  "vp/utils": "../dom/utils.js",
};

/**
 * Specifiers that point at a module in SOURCES. An import map entry is keyed by
 * URL, so both names load the same module instance.
 */
const ALIASES = {
  "@vanillapod/dom": "vp/dom",
  "@vanillapod/state": "vp/state",
};

/** "vanillapod" re-exports both packages, so examples need one import. */
const COMBINED = `export * from "vp/dom";\nexport * from "vp/state";\n`;

const encode = (code) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(code)));
const decode = (b64) =>
  new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

// Share links use URL-safe base64: "+" in a query string is read as a space,
// which corrupted any code whose base64 contained one.
const encodeShared = (code) =>
  encode(code).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
const decodeShared = (value) =>
  // Also accept links made before this change, whose "+" arrived as " ".
  decode(value.replaceAll(" ", "+").replaceAll("-", "+").replaceAll("_", "/"));

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
        /(from\s+)["']\.\/(\w+)\.js["']/g,
        (_, from, file) => `${from}"vp/${file}"`,
      );
      imports[name] = `data:text/javascript;base64,${encode(source)}`;
    }
    for (const [alias, name] of Object.entries(ALIASES)) {
      imports[alias] = imports[name];
    }
    imports.vanillapod = `data:text/javascript;base64,${encode(COMBINED)}`;
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

/** Shown only when a <vp-playground> has no <pre> examples of its own. */
const FALLBACK_EXAMPLE =
  `import { effect, signal, button, p, render } from "vanillapod";

const count = signal(0);

const output = p();
// effect runs now, and again whenever a signal it read changes
effect(() => {
  output.textContent = \`Count: \${count()}\`;
});

render(
  [
    output,
    button({ onClick: () => count((n) => n + 1) }, "Increment"),
    button({ onClick: () => count((n) => n - 1) }, "Decrement"),
  ],
  document.querySelector("#app"),
);
`;

/** Removes the indentation shared by every non-empty line. */
function dedent(text) {
  const lines = text.replace(/\s+$/, "").split("\n");
  const indents = lines.filter((line) => line.trim()).map((line) =>
    line.match(/^[ \t]*/)[0].length
  );
  const strip = Math.min(...indents, Infinity);
  return (strip === Infinity ? lines : lines.map((line) => line.slice(strip)))
    .join("\n") + "\n";
}

let instances = 0;

/**
 * `<vp-playground>`: an editor, sandboxed live preview and console.
 *
 * Light DOM only (no shadow root), so page CSS and Prism's theme apply as-is.
 *
 * Examples are authored as `<pre>` children, read once when the element
 * connects (escape `<` and `&` in the code). Each becomes a dropdown entry,
 * labelled by `data-title` or else its `id`. With no `<pre>` children, one
 * built-in example is shown.
 *
 * ```html
 * <vp-playground example="counter">
 *   <pre id="counter" data-title="Counter">import { ... } from "vanillapod";</pre>
 * </vp-playground>
 * ```
 *
 * Attributes:
 * - `example`: id of the example to start with (default: the first)
 * - `share`: sync code with the URL `#code=` hash and show "Copy share link"
 *   (use on one playground per page)
 */
export class Playground extends HTMLElement {
  static get tagName() {
    return "vp-playground";
  }

  /** @type {{ id: string, title: string, code: string }[]} */
  #examples = [];
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
    this.#examples = [...this.querySelectorAll(":scope > pre")].map((
      pre,
      i,
    ) => ({
      id: pre.id || `example-${i + 1}`,
      title: pre.dataset.title || pre.id || `Example ${i + 1}`,
      code: dedent(pre.textContent),
    }));
    if (!this.#examples.length) {
      this.#examples = [{
        id: "counter",
        title: "Counter",
        code: FALLBACK_EXAMPLE,
      }];
    }
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
            autocapitalize="off" autocorrect="off"
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

    for (const { id, title } of this.#examples) {
      example.append(new Option(title, id));
    }
    // A single example needs no picker.
    example.closest("label").hidden = this.#examples.length < 2;
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
    // browsers disagree about what that inserts: Chromium and WebKit put in a
    // <br> or <div><br></div> that textContent (and so CodeJar) never sees, so
    // the newline is lost on the next highlight. execCommand gives different
    // results per engine too, so edit the text model directly instead.
    editor.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.key !== "Enter") return;
      if (event.shiftKey || event.altKey || event.isComposing) return;
      event.preventDefault();
      const [start, end] = this.#selectionOffsets(editor);
      const code = this.#jar.toString();
      let after = code.slice(end);
      // A lone "\n" at the very end isn't a visible line, so the caret can't
      // sit after it. Keep a "\n" after the caret, like CodeJar's legacy mode.
      if (after === "") after = "\n";
      this.#jar.updateCode(`${code.slice(0, start)}\n${after}`);
      this.#setCaretOffset(editor, start + 1);
    });

    addEventListener("message", this.#onMessage);
    if (this.#shared) addEventListener("hashchange", this.#onHashChange);

    if (!(this.#shared && this.#loadFromHash())) {
      const wanted = this.getAttribute("example");
      const start = this.#examples.find((e) => e.id === wanted);
      this.#loadExample((start ?? this.#examples[0]).id);
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

  /**
   * Replaces the editor's code. WebKit keeps a selection that pointed into the
   * old content, at an offset the new content may not have; CodeJar's next
   * keydown then throws IndexSizeError while saving it. If the selection is
   * inside the editor, reset it to the start.
   */
  #setCode(code) {
    const { editor } = this.#parts;
    this.#jar.updateCode(code, false);
    const selection = getSelection();
    if (selection.rangeCount && editor.contains(selection.anchorNode)) {
      this.#setCaretOffset(editor, 0);
    }
  }

  /** Selection start and end as character offsets into the editor's text. */
  #selectionOffsets(editor) {
    const selection = getSelection();
    const offsetOf = (node, offset) => {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.setEnd(node, offset);
      return range.toString().length;
    };
    const a = offsetOf(selection.anchorNode, selection.anchorOffset);
    const b = offsetOf(selection.focusNode, selection.focusOffset);
    return [Math.min(a, b), Math.max(a, b)];
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
        // Keep the caret visible (programmatic selection doesn't scroll).
        const parent = node.parentElement;
        if (parent && parent !== editor) {
          parent.scrollIntoView({ block: "nearest" });
        } else if (offset >= editor.textContent.length - 1) {
          editor.scrollTop = editor.scrollHeight;
        }
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
    if (event.data.level === "error") {
      this.#setStatus("Error — see console", true);
    }
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

  #loadExample(id) {
    const { code } = this.#examples.find((e) => e.id === id) ??
      this.#examples[0];
    this.#setCode(code);
    this.#parts.example.value = id;
    if (this.#shared) history.replaceState(null, "", location.pathname);
    this.run();
  }

  #loadFromHash() {
    const shared = new URLSearchParams(location.hash.slice(1)).get("code");
    if (!shared) return false;
    try {
      this.#setCode(decodeShared(shared));
      this.#parts.example.value = "";
    } catch {
      return false;
    }
    this.run();
    return true;
  }

  async #copyShareLink() {
    const url = `${location.origin}${location.pathname}#code=${
      encodeShared(this.#jar.toString())
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
