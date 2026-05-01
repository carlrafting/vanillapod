import lume from "lume/mod.ts";

const site = lume({
    src: "src",
});

site.copy("assets/logo.png");
site.copy([".css", ".js"]);

export default site;
