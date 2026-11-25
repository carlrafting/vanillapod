/**
 * Build-time helpers for the component documentation pages. They read a
 * component's own files, so the source and custom properties shown on its
 * page always match what ships.
 */

export interface SourceFile {
  name: string;
  language: string;
  code: string;
}

export interface CustomProperty {
  name: string;
  value: string;
}

const languages: Record<string, string> = {
  ".vto": "html",
  ".css": "css",
  ".js": "javascript",
};

/** Removes a leading `---` front matter block. */
function stripFrontMatter(source: string): string {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim() + "\n";
}

function extension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot);
}

/**
 * The files of the component in `dir`: the demo markup (`index.vto` without
 * its front matter), then stylesheets, then scripts. Files starting with `_`
 * are internal and left out.
 */
export function componentSources(dir: string): SourceFile[] {
  const names = [...Deno.readDirSync(dir)]
    .filter((entry) => entry.isFile && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .filter((name) => extension(name) in languages);

  const order = [".vto", ".css", ".js"];
  names.sort((a, b) =>
    order.indexOf(extension(a)) - order.indexOf(extension(b)) ||
    a.localeCompare(b)
  );

  return names.map((name) => {
    const code = Deno.readTextFileSync(`${dir}/${name}`);
    return {
      name: name === "index.vto" ? "index.html" : name,
      language: languages[extension(name)],
      code: name === "index.vto" ? stripFrontMatter(code) : code,
    };
  });
}

/** Index of the `)` closing the `(` just before `start`, or -1. */
function closingParen(text: string, start: number): number {
  let depth = 1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")" && --depth === 0) return i;
  }
  return -1;
}

/**
 * Custom properties a stylesheet declares (`--name: value;`) or reads with a
 * fallback (`var(--name, value)`), in the order they first appear. The first
 * value seen is the default; later overrides, such as variants, are ignored.
 */
export function customProperties(css: string): CustomProperty[] {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const found: { index: number; name: string; value: string }[] = [];

  for (const match of text.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
    found.push({
      index: match.index,
      name: match[1],
      value: match[2].trim(),
    });
  }

  for (const match of text.matchAll(/var\(\s*(--[\w-]+)\s*,/g)) {
    const start = match.index + match[0].length;
    const end = closingParen(text, start);
    if (end === -1) continue;
    found.push({
      index: match.index,
      name: match[1],
      value: text.slice(start, end).trim(),
    });
  }

  found.sort((a, b) => a.index - b.index);
  const seen = new Map<string, string>();
  for (const { name, value } of found) {
    if (!seen.has(name)) seen.set(name, value);
  }
  return [...seen].map(([name, value]) => ({ name, value }));
}

/** Custom properties of every stylesheet among a component's sources. */
export function componentCustomProperties(dir: string): CustomProperty[] {
  const css = componentSources(dir)
    .filter((file) => file.language === "css")
    .map((file) => file.code)
    .join("\n");
  return customProperties(css);
}
