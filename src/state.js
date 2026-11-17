// @ts-self-types="./state.d.ts"
import { createError } from "./error.js";
import { checkType, createArray } from "./utils.js";

/** @import { ArrayPlus } from "./utils.js" */

/**
 * A state listener, called with the previous and current state.
 *
 * @typedef {(prevState?: any, currentState?: any) => void} Listener
 */

/**
 * The value returned by `createReactive`.
 *
 * @template T
 * @typedef {object} Reactive
 * @property {() => T} read - read the current state (and subscribe the running effect)
 * @property {(newValue: T | (() => T)) => void} dispatch - update the state
 * @property {(fn: Listener) => (() => void) | undefined} subscribe - subscribe to state updates, returns an unsubscribe function
 */

console.time("state");

/** @type {ArrayPlus<any>} */
const effects = createArray([]);

/**
 * # notify
 *
 * @param {Set<Listener>} listeners set of state listeners that updates on state updates
 * @param {*} [prevState]
 * @param {*} [currentState]
 */
function notify(listeners, prevState, currentState) {
  console.time("notify");
  /* if (listeners.size === 0) {
        createError('state: No listeners registered!');
    } */
  console.log({ listeners });
  for (const subscriber of listeners) {
    // console.log('notifyListeners', listener);
    if (subscriber && checkType(subscriber) === "function") {
      if (prevState !== currentState) {
        subscriber(prevState, currentState);
      }
    }
  }
  console.timeEnd("notify");
}

/**
 * # subscribe
 *
 * @param {Set<Listener> | ArrayPlus<Listener>} listeners - set/array++ of listeners
 * @param {Listener} fn - listener fn
 * @returns {(() => void) | undefined} - unsubscribe function
 */
function subscribe(listeners, fn) {
  if (listeners instanceof Set) {
    console.log("subscribing to set of listeners");
    const unsubscribe = () => {
      listeners.delete(fn);
    };
    listeners.add(fn);
    return unsubscribe;
  }
  if (checkType(listeners) === "array++") {
    console.log("subscribing to array++ of listeners");
    const unsubscribe = () => {
      const index = /** @type {any} */ (listeners).indexOf(fn);
      console.log({ index });
    };
    listeners.add(fn);
    return unsubscribe;
  }
}

const unsubscribes = new Set();

/**
 * # scheduleEffect
 *
 * @param {Set<Listener>} listeners set of state listeners that updates on state updates
 */
function scheduleEffect(listeners) {
  console.time("scheduleEffect");
  const effect = effects.last();
  // effect && console.log('runListenerEffect', { effect });
  if (effect) {
    const unsubscribe = subscribe(listeners, effect);
    unsubscribes.add(unsubscribe);
    console.log("unsubscribes", { unsubscribes });
  }
  console.timeEnd("scheduleEffect");
}

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
export function createReactive(initialValue) {
  let state = initialValue;
  /** @type {Set<Listener>} */
  const listeners = new Set();

  function read() {
    scheduleEffect(listeners);
    // console.log('read', { fx: effects.entries(), listeners });
    return state;
  }

  /**
   * dispatch
   *
   * @param {T | (() => T)} newValue update state with `newValue`
   */
  function dispatch(newValue) {
    const prevState = state;
    const currentState = checkType(newValue) === "function"
      ? /** @type {() => T} */ (newValue)()
      : /** @type {T} */ (newValue);
    if (prevState !== currentState) {
      state = currentState;
    }
    notify(listeners, prevState, currentState);
  }

  return {
    read,
    dispatch,
    subscribe: (fn) => subscribe(listeners, fn),
  };
}

/**
 * # store
 *
 * a method for storing state defined as an object
 *
 * @param {Record<string, any>} value - the initial state represented as an object
 * @returns {[(key?: string) => any, (key: string, value: any) => void]} getter and setter
 */
export function store(value) {
  let state = value;
  /** @type {Record<string, any> | null} */
  let prevState = null;
  /**
   * @param {string} [key] - optional key defined on state object
   * @returns {any}
   */
  const getStore = (key) => {
    if (key && Object.hasOwn(state, key)) {
      return state[key];
    }
    return state;
  };
  /**
   * # writeStore
   *
   * @param {string} key - a key on state object to change
   * @param {any} value - state changes represented either by a new object directly or as result by a function
   * @returns {void}
   */
  const setStore = (key, value) => {
    if (key && typeof key !== "string") {
      createError(`Value must be of type 'String'!`, TypeError);
    }
    prevState = state;
    const valueType = checkType(value);
    if (valueType === "function") {
      const fn = value;
      state[key] = fn(prevState[key]);
      return;
    }
    state = {
      ...prevState,
      [key]: valueType === "object"
        ? (Object.hasOwn(prevState, key) && {
          ...prevState[key],
          ...value,
        }) || { [key]: { ...value } }
        : valueType === "array"
        ? [...value]
        : value,
    };
  };
  return [getStore, setStore];
}

export const useStore = store;
export const makeStore = store;
export const createStore = store;

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
export function signal(value) {
  const s = createReactive(value);
  return [s.read, s.dispatch];
}

export const createSignal = signal;
export const useSignal = signal;
export const makeSignal = signal;

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
function effect(fn) {
  // console.log('createListenerEffect:', effects.entries());
  console.time("effect");
  /** @type {Listener} */
  const run = (prevState, currentState) => {
    effects.clear();
    // effects.add(fn);
    subscribe(effects, fn);
    // console.log({ effects: effects.entries() });
    try {
      fn(prevState, currentState);
    } finally {
      /* catch (error) {
            console.log(error);
        } */
      effects.entries().pop();
    }
  };
  run();
  console.timeEnd("effect");
}

export const createEffect = effect;
export const makeEffect = effect;
export const useEffect = effect;

/**
 * Items that were added, removed or modified between two arrays.
 *
 * @typedef {{ added: any[], removed: any[], modified: any[] }} ChangeResults
 */

/**
 * @overload
 * @param {any[]} prev previous state
 * @param {any[]} current current state
 * @returns {ChangeResults}
 */
/**
 * @template R
 * @overload
 * @param {any[]} prev previous state
 * @param {any[]} current current state
 * @param {(results: ChangeResults) => R} fn callback receiving the results
 * @returns {R}
 */
/**
 * # onChange
 *
 * @param {any[]} prev previous state
 * @param {any[]} current current state
 * @param {(results: ChangeResults) => unknown} [fn] callback receiving the results
 * @returns {unknown}
 */
export function onChange(prev, current, fn) {
  const added = [];
  const removed = [];
  const modified = [];

  const maxIterations = Math.max(prev.length, current.length);

  for (let i = 0; i < maxIterations; i++) {
    const currentItem = current[i];
    const prevIem = prev[i];
    if (JSON.stringify(currentItem) !== JSON.stringify(prevIem)) {
      // add array item
      if (current.length > prev.length) {
        added.push(currentItem);
      }
      // modified array item
      if (prev.length === current.length) {
        modified.push(currentItem);
      }
      // remove array item
      if (prev.length > current.length) {
        removed.push(prevIem);
      }
    }
  }

  const results = {
    added,
    removed,
    modified,
  };

  if (fn && typeof fn === "function") {
    return fn(results);
  }

  return results;
}

/**
 * # memo
 *
 * @template {(...args: any[]) => any} F
 * @param {F} [fn]
 * @returns {(F & { cache: Map<string, ReturnType<F>> }) | undefined} memoized function, or `undefined` if `fn` is not a function
 */
export function memo(fn = /** @type {F} */ (() => {})) {
  if (!fn || fn === null || typeof fn !== "function") {
    return createError(
      "memo: expected argument to be a function",
      TypeError,
    );
  }
  // const cache = new WeakMap();
  const cache = new Map();
  /** @param {...any} args */
  const ref = (...args) => {
    // NOTE: args are spread into JSON.stringify(value, replacer, space), so only the first one forms the key
    const key = JSON.stringify(.../** @type {[any]} */ (args));
    // const key = [...args];
    console.log("memo: key", key);
    if (cache.has(key)) {
      console.log("memo: getting cached value");
      return cache.get(key);
    }
    const result = fn(...args);
    console.log("memo: adding result to cache");
    cache.set(key, result);
    return result;
  };
  ref.cache = cache;
  return /** @type {F & { cache: Map<string, ReturnType<F>> }} */ (
    /** @type {unknown} */ (ref)
  );
}

export const createMemo = memo;
export const makeMemo = memo;
export const useMemo = memo;

console.timeEnd("state");
