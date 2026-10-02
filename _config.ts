import lume from "lume/mod.ts";
import prismPlugin from "lume/plugins/prism.ts";
import { escape } from "@std/html";

const site = lume();
site.ignore("./legacy");
site.loadPages([".html.vto"]);
site.use(prismPlugin());
site.copy([".css", ".js", ".png", ".avif"]);
site.filter("escape", (input) => escape(input));

export default site;
