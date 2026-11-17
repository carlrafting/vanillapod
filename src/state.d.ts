/**
 * # createReactive
 *
 * @description a method with automatic subscription and effect scheduling *
 * @template T
 * @param {T} initialValue the initial value for the state *
 * @returns {Reactive<T>}
 * @example
 *
    // create reactive message state and read current state
    const message = createReactive('');
    message.dispatch('...');
    message(); // '...'
    message.dispatch('Hello World!');
    message(); // 'Hello World'

    // create reactive count state and subscribe to state updates
    const count = createReactive(0);
    count.subscribe(function logCount() {
        console.log('Count is now: ', count.read());
    });
    count.dispatch(count.read() + 1); // Count is now: 1
    count.dispatch(count.read() + 3); // Count is now: 4
 */
export function createReactive<T>(initialValue: T): Reactive<T>;
/**
 * # store
 *
 * a method for storing state defined as an object
 *
 * @param {Record<string, any>} value - the initial state represented as an object
 * @returns {[(key?: string) => any, (key: string, value: any) => void]} getter and setter
 */
export function store(value: Record<string, any>): [(key?: string) => any, (key: string, value: any) => void];
/**
 * # signal
 *
 * @description a thin wrapper around store method with an api similar to solid.js
 * @template T
 * @param {T} value
 * @returns {[() => T, (newValue: T | (() => T)) => void]} getter and setter
 * @example
 *
    const [counter, setCounter] = createSignal(0);
    setCounter(counter() + 3)
    setTimeout(() => setCounter(counter() * 6), 1000);
 */
export function signal<T>(value: T): [() => T, (newValue: T | (() => T)) => void];
/**
 * @overload
 * @param {any[]} prev previous state
 * @param {any[]} current current state
 * @returns {ChangeResults}
 */
export function onChange(prev: any[], current: any[]): ChangeResults;
/**
 * @template R
 * @overload
 * @param {any[]} prev previous state
 * @param {any[]} current current state
 * @param {(results: ChangeResults) => R} fn callback receiving the results
 * @returns {R}
 */
export function onChange<R>(prev: any[], current: any[], fn: (results: ChangeResults) => R): R;
/**
 * # memo
 *
 * @template {(...args: any[]) => any} F
 * @param {F} [fn]
 * @returns {(F & { cache: Map<string, ReturnType<F>> }) | undefined} memoized function, or `undefined` if `fn` is not a function
 */
export function memo<F extends (...args: any[]) => any>(fn?: F): (F & {
    cache: Map<string, ReturnType<F>>;
}) | undefined;
/**
 * # store
 *
 * a method for storing state defined as an object
 *
 * @param {Record<string, any>} value - the initial state represented as an object
 * @returns {[(key?: string) => any, (key: string, value: any) => void]} getter and setter
 */
export function useStore(value: Record<string, any>): [(key?: string) => any, (key: string, value: any) => void];
/**
 * # store
 *
 * a method for storing state defined as an object
 *
 * @param {Record<string, any>} value - the initial state represented as an object
 * @returns {[(key?: string) => any, (key: string, value: any) => void]} getter and setter
 */
export function makeStore(value: Record<string, any>): [(key?: string) => any, (key: string, value: any) => void];
/**
 * # store
 *
 * a method for storing state defined as an object
 *
 * @param {Record<string, any>} value - the initial state represented as an object
 * @returns {[(key?: string) => any, (key: string, value: any) => void]} getter and setter
 */
export function createStore(value: Record<string, any>): [(key?: string) => any, (key: string, value: any) => void];
/**
 * # signal
 *
 * @description a thin wrapper around store method with an api similar to solid.js
 * @template T
 * @param {T} value
 * @returns {[() => T, (newValue: T | (() => T)) => void]} getter and setter
 * @example
 *
    const [counter, setCounter] = createSignal(0);
    setCounter(counter() + 3)
    setTimeout(() => setCounter(counter() * 6), 1000);
 */
export function createSignal<T>(value: T): [() => T, (newValue: T | (() => T)) => void];
/**
 * # signal
 *
 * @description a thin wrapper around store method with an api similar to solid.js
 * @template T
 * @param {T} value
 * @returns {[() => T, (newValue: T | (() => T)) => void]} getter and setter
 * @example
 *
    const [counter, setCounter] = createSignal(0);
    setCounter(counter() + 3)
    setTimeout(() => setCounter(counter() * 6), 1000);
 */
export function useSignal<T>(value: T): [() => T, (newValue: T | (() => T)) => void];
/**
 * # signal
 *
 * @description a thin wrapper around store method with an api similar to solid.js
 * @template T
 * @param {T} value
 * @returns {[() => T, (newValue: T | (() => T)) => void]} getter and setter
 * @example
 *
    const [counter, setCounter] = createSignal(0);
    setCounter(counter() + 3)
    setTimeout(() => setCounter(counter() * 6), 1000);
 */
export function makeSignal<T>(value: T): [() => T, (newValue: T | (() => T)) => void];
/**
 * # effect
 *
 * @param {Listener} fn a callback function that runs whenever the state updates
 * @returns {void}
 * @example
 *
    const [counter,setCounter] = signal(0);
    setCounter(counter() + 3);
    createEffect(() => {
        console.log(counter())
    });
 */
export function createEffect(fn: Listener): void;
/**
 * # effect
 *
 * @param {Listener} fn a callback function that runs whenever the state updates
 * @returns {void}
 * @example
 *
    const [counter,setCounter] = signal(0);
    setCounter(counter() + 3);
    createEffect(() => {
        console.log(counter())
    });
 */
export function makeEffect(fn: Listener): void;
/**
 * # effect
 *
 * @param {Listener} fn a callback function that runs whenever the state updates
 * @returns {void}
 * @example
 *
    const [counter,setCounter] = signal(0);
    setCounter(counter() + 3);
    createEffect(() => {
        console.log(counter())
    });
 */
export function useEffect(fn: Listener): void;
/**
 * # memo
 *
 * @template {(...args: any[]) => any} F
 * @param {F} [fn]
 * @returns {(F & { cache: Map<string, ReturnType<F>> }) | undefined} memoized function, or `undefined` if `fn` is not a function
 */
export function createMemo<F extends (...args: any[]) => any>(fn?: F): (F & {
    cache: Map<string, ReturnType<F>>;
}) | undefined;
/**
 * # memo
 *
 * @template {(...args: any[]) => any} F
 * @param {F} [fn]
 * @returns {(F & { cache: Map<string, ReturnType<F>> }) | undefined} memoized function, or `undefined` if `fn` is not a function
 */
export function makeMemo<F extends (...args: any[]) => any>(fn?: F): (F & {
    cache: Map<string, ReturnType<F>>;
}) | undefined;
/**
 * # memo
 *
 * @template {(...args: any[]) => any} F
 * @param {F} [fn]
 * @returns {(F & { cache: Map<string, ReturnType<F>> }) | undefined} memoized function, or `undefined` if `fn` is not a function
 */
export function useMemo<F extends (...args: any[]) => any>(fn?: F): (F & {
    cache: Map<string, ReturnType<F>>;
}) | undefined;
/**
 * Items that were added, removed or modified between two arrays.
 */
export type ChangeResults = {
    added: any[];
    removed: any[];
    modified: any[];
};
/**
 * A state listener, called with the previous and current state.
 */
export type Listener = (prevState?: any, currentState?: any) => void;
/**
 * The value returned by `createReactive`.
 */
export type Reactive<T> = {
    /**
     * - read the current state (and subscribe the running effect)
     */
    read: () => T;
    /**
     * - update the state
     */
    dispatch: (newValue: T | (() => T)) => void;
    /**
     * - subscribe to state updates, returns an unsubscribe function
     */
    subscribe: (fn: Listener) => (() => void) | undefined;
};
