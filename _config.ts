import lume from "lume/mod.ts";
import prismPlugin from "lume/plugins/prism.ts";
// Languages beyond Prism's defaults, for the shell and YAML examples in docs/.
import "https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-bash.js";
import "https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-yaml.js";
import { escape } from "@std/html";
import {
  componentCustomProperties,
  componentSources,
} from "./_lib/components.ts";

const site = lume();
site.loadPages([".html.vto"]);
site.use(prismPlugin());
site.copy("./assets");
site.copy("./dom/main.js", "./dom/main.js");
site.copy("./dom/utils.js", "./dom/utils.js");
site.copy("./state/main.js", "./state/main.js");
site.copy([".css", ".js", ".png", ".avif"]);
site.filter("escape", (input: string) => escape(input));
// Component pages show their own files, read from the folder their URL maps to.
site.filter(
  "componentSources",
  (url: string) => componentSources(site.src(url)),
);
site.filter(
  "componentProperties",
  (url: string) => componentCustomProperties(site.src(url)),
);
site.ignore("./.claude/", "./README.md", "./components/README.md", "./tests");

export default site;
