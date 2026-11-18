import { CodeJar } from "./vendor/codejar.js";
import { defaultExample, examples } from "./examples.js";

const $ = (id) => document.getElementById(id);
const editor = $("pg-editor");
const getCode = () => jar.toString();
const setCode = (code) => jar.updateCode(code, false);
const preview = $("pg-preview");
const consoleEl = $("pg-console");
const status = $("pg-status");
const select = $("pg-example");
const auto = $("pg-auto");

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

/** Library modules as data: URLs so the iframe can stay fully sandboxed
 * (no same-origin access, so shared links can't touch the docs site). */
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

async function run() {
  const importMap = await loadImportMap();
  consoleEl.replaceChildren();
  setStatus("");
  const code = getCode().replaceAll("</script", "<\\/script");
  preview.srcdoc = `<!doctype html><meta charset="utf-8">
<style>${frameStyles}</style>
<script type="importmap">${importMap}</script>
<script>${bridge}</script>
<div id="app"></div>
<script type="module">${code}</script>`;
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.toggleAttribute("data-error", isError);
}

addEventListener("message", (event) => {
  if (event.source !== preview.contentWindow || !event.data?.pg) return;
  const li = document.createElement("li");
  li.dataset.level = event.data.level;
  li.textContent = event.data.args.join(" ");
  consoleEl.append(li);
  consoleEl.scrollTop = consoleEl.scrollHeight;
  if (event.data.level === "error") setStatus("Error — see console", true);
});

let timer;
function schedule() {
  if (!auto.checked) return;
  clearTimeout(timer);
  timer = setTimeout(run, 500);
}

function loadExample(name) {
  setCode(examples[name]);
  select.value = name;
  history.replaceState(null, "", location.pathname);
  run();
}

for (const name of Object.keys(examples)) {
  select.append(new Option(name, name));
}
select.addEventListener("change", () => loadExample(select.value));

// Registered before CodeJar so it sees keys first: after Escape, let Tab leave
// the editor instead of inserting a tab (keyboard-trap escape hatch).
let escaped = false;
editor.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && escaped) {
    event.stopImmediatePropagation();
  } else if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    run();
  }
  escaped = event.key === "Escape";
});
editor.addEventListener("blur", () => (escaped = false));

const jar = CodeJar(
  editor,
  (el) => Prism.highlightElement(el),
  { tab: "  ", addClosing: false },
);
jar.onUpdate(schedule);

$("pg-run").addEventListener("click", run);
$("pg-reset").addEventListener("click", () => loadExample(select.value));
$("pg-share").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}#code=${encode(getCode())}`;
  history.replaceState(null, "", url);
  try {
    await navigator.clipboard.writeText(url);
    setStatus("Link copied");
  } catch {
    setStatus("Link is in the address bar");
  }
});

// Start from a shared link if there is one, otherwise the default example.
function loadFromHash() {
  const shared = new URLSearchParams(location.hash.slice(1)).get("code");
  if (!shared) return false;
  try {
    setCode(decode(shared));
    select.value = "";
  } catch {
    return false;
  }
  run();
  return true;
}

addEventListener("hashchange", loadFromHash);
if (!loadFromHash()) loadExample(defaultExample);
