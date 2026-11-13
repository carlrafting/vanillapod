import { assertThrows } from "@std/assert";
import { createDebug } from "./debug.js";
import debug from "./debug.js";
import { createError } from "./error.js";

const setDebug = (on: boolean) => {
  if (on) debug(true);
  else createDebug("test")("reset").disable();
};

Deno.test("createError throws when debug is enabled", () => {
  setDebug(true);
  try {
    assertThrows(
      () => createError("This will throw an error..."),
      Error,
      "This will throw",
    );
    assertThrows(
      () => createError("bad ref", ReferenceError),
      ReferenceError,
      "bad ref",
    );
  } finally {
    setDebug(false);
  }
});

Deno.test("createError does not throw when debug is disabled", () => {
  setDebug(false);
  createError("This will be added to errors array...");
});
