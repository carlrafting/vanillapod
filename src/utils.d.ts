/**
 * delay
 *
 * delay execution of a function/method
 *
 * @param {(...args: any[]) => unknown} fn - function to execute later
 * @param {number} timeout - amount of timeout in milliseconds
 * @param {...any} args - arguments to pass on to fn
 * @returns {ReturnType<typeof setTimeout>} timeout id
 */
export function delay(fn: (...args: any[]) => unknown, timeout: number, ...args: any[]): ReturnType<typeof setTimeout>;
/**
 * debounce
 *
 * Only execute a function/method within a certain amount of time.
 * Useful to avoid doing unecessary work that impacts performance.
 * Will only be used on internal methods and not exposed in the public API.
 *
 * http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 *
 * @param {(...args: any[]) => unknown} fn - function to debounce
 * @param {number} [treshold] - value in milliseconds
 * @param {boolean} [asap] - fn should execute asap or not
 * @returns {(...args: any[]) => void} debounced function
 */
export function debounce(fn: (...args: any[]) => unknown, treshold?: number, asap?: boolean): (...args: any[]) => void;
/**
 * debounceRAF
 *
 * @param {(...args: any[]) => unknown} fn - function to debounce
 * @returns {(...args: any[]) => void} debounced function
 */
export function debounceRAF(fn: (...args: any[]) => unknown): (...args: any[]) => void;
/**
 * checkType
 *
 * A more reliable way of checking type of values.
 *
 * @param {unknown} [value] - value to check type of
 * @returns {string} lowercase type name, e.g. `"array"`, `"object"`, `"function"`
 */
export function checkType(value?: unknown): string;
/**
 * traverseChildNodes
 *
 * @param {Node | null} [parent]
 * @param {(child: ChildNode) => void} [callback]
 * @returns {undefined}
 */
export function traverseChildNodes(parent?: Node | null, callback?: (child: ChildNode) => void): undefined;
/**
 * An array wrapper returned by `createArray`.
 *
 * @template T
 * @typedef {{
 *   get(index: number): T,
 *   first(): T,
 *   last(): T,
 *   add(item: T): number,
 *   remove(index: number): T[],
 *   clone(): T[],
 *   entries(): T[],
 *   clear(): boolean,
 *   [Symbol.iterator](): Generator<T, void, unknown>,
 *   readonly [Symbol.toStringTag]: string,
 * }} ArrayPlus
 */
/**
 * createArray
 *
 * @template T
 * @param  {...T} items items to spread into a new array
 * @returns {ArrayPlus<T>}
 * @example
 *
    // methods
    const nums = createArray(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    nums.get(1), // 2
    nums.add(11), // 11
    nums.remove(5), // [6]
    nums.entries(), // [1,2,3,4,5,6,7,8,9,10,11]
    nums.clear(), // true
    nums.entries() // []

    // iterate
    const arr = createArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    for (const item of arr) {
        console.log(item);
    }
 */
export function createArray<T>(...items: T[]): ArrayPlus<T>;
/**
 * # createLocalStorage
 *
 * @param {string} [key]
 * @param {*} [initialData]
 * @returns {{ read(): any, write(data: unknown): void }}
 */
export function createLocalStorage(key?: string, initialData?: any): {
    read(): any;
    write(data: unknown): void;
};
/**
 * # isEqual
 *
 * @param {any} first
 * @param {any} second
 * @returns {boolean}
 */
export function isEqual(first: any, second: any): boolean;
/**
 * An array wrapper returned by `createArray`.
 */
export type ArrayPlus<T> = {
    get(index: number): T;
    first(): T;
    last(): T;
    add(item: T): number;
    remove(index: number): T[];
    clone(): T[];
    entries(): T[];
    clear(): boolean;
    [Symbol.iterator](): Generator<T, void, unknown>;
    readonly [Symbol.toStringTag]: string;
};
