import lume from "lume/mod.ts";

const site = lume({
  src: "docs",
});

site.remote("assets/global.css", "assets/global.css");
site.remote("logo.small.avif", "assets/logo.small.avif");
site.copy([".css", ".js", ".png", ".avif"]);

export default site;
