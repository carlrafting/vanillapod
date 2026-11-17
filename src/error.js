// @ts-self-types="./error.d.ts"
import debug from "./debug.js";

const errors = new Set();

/**
 * createError
 *
 * Throws `exception` when debug mode is enabled, otherwise records the error
 * silently (see `logErrors`).
 *
 * @param {string} [message] - error message
 * @param {ErrorConstructor} [exception] - error constructor to throw, defaults to `Error`
 * @returns {undefined}
 */
export function createError(message = "", exception = Error) {
  if (debug()) {
    if (message !== "") {
      throw new exception(message);
    }
  }

  errors.add({ exception: message, type: exception });
}

/**
 * logErrors
 *
 * Logs all errors recorded by `createError`.
 *
 * @returns {void}
 */
export function logErrors() {
  for (const err of [...errors]) {
    console.log(err);
  }
}
