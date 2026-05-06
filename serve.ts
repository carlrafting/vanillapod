import Server from "lume/core/server.ts";

const server = new Server({
  root: `${Deno.cwd()}/_site`,
});

server.start();
