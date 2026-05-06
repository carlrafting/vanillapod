import lume from "lume/mod.ts";
import prismPlugin from "lume/plugins/prism.ts";
import { escape } from "@std/html";

const site = lume({
  src: "docs",
});
site.loadPages([".html.vto"]);
site.use(prismPlugin());
site.remote("assets/global.css", "assets/global.css");
site.remote("logo.small.avif", "assets/logo.small.avif");
site.copy([".css", ".js", ".png", ".avif"]);
site.filter("escape", (input) => escape(input));

export default site;
