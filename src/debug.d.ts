/**
 * debug
 *
 * @param {boolean} [value] - enable or disable debug output; omit to read the current state
 * @returns {boolean | undefined} the current debug state when called without a value
 */
export default function debug(value?: boolean): boolean | undefined;
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
export function createDebug(name?: string): (method?: string) => Debugger;
export type Debugger = {
    /**
     * - enable debug output
     */
    enable: () => void;
    /**
     * - disable debug output
     */
    disable: () => void;
    /**
     * - log output prefixed with a timestamp, name and method
     */
    log: (...output: unknown[]) => void;
};
