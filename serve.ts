import Server from "lume/core/server.ts";

const server = new Server({
  root: `${Deno.cwd()}/_site`,
  port: 3000,
});

server.start();
