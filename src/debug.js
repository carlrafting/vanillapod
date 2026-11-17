// @ts-self-types="./debug.d.ts"
let VANILLAPOD_DEBUG = false;

/**
 * debug
 *
 * @param {boolean} [value] - enable or disable debug output; omit to read the current state
 * @returns {boolean | undefined} the current debug state when called without a value
 */
export default function debug(value) {
  if (value === undefined) {
    return VANILLAPOD_DEBUG;
  }

  if (typeof value === "boolean") VANILLAPOD_DEBUG = value;
}

/**
 * @typedef {object} Debugger
 * @property {() => void} enable - enable debug output
 * @property {() => void} disable - disable debug output
 * @property {(...output: unknown[]) => void} log - log output prefixed with a timestamp, name and method
 */

/**
 * createDebug
 *
 * @param {string} [name] - name to prefix log output with
 * @returns {(method?: string) => Debugger} a factory for a debugger scoped to `method`
 */
export function createDebug(name = "") {
  const __proto__ = (method = "") => ({
    enable() {
      VANILLAPOD_DEBUG = true;
    },
    disable() {
      VANILLAPOD_DEBUG = false;
    },
    /** @param {...unknown} output */
    log(...output) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(timestamp, name, method, ...output);
    },
  });
  return __proto__;
}
