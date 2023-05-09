import debug from './debug.js';
import { isEqual } from './utils.js';
import { createError, logErrors } from './error.js';
import { createArray, checkType } from './utils.js';

console.time('state');

const effects = createArray([]);

/**
 * # notify
 *
 * @param {Set<function>} listeners set of state listeners that updates on state updates
 * @param {*} [prevState]
 * @param {*} [currentState]
 */
function notify(listeners, prevState, currentState) {
    console.time('notify');
    /* if (listeners.size === 0) {
        createError('state: No listeners registered!');
    } */
    console.log({ listeners });
    for (const subscriber of listeners) {
        // console.log('notifyListeners', listener);
        if (subscriber && checkType(subscriber) === 'function') {
            if (prevState !== currentState) {
                subscriber(prevState, currentState);
            }
        }
    }
    console.timeEnd('notify');
}

/**
 * # subscribe
 *
 * @param {Iterable<function>} listeners - set/array++ of listeners
 * @param {function} fn - listener fn
 * @returns {function} - unsubscribe function
 */
function subscribe(listeners, fn) {
    if (checkType(listeners) === 'set') {
        console.log('subscribing to set of listeners');
        const unsubscribe = () => {
            listeners.delete(fn);
        };
        listeners.add(fn);
        return unsubscribe;
    }
    if (checkType(listeners) === 'array++') {
        console.log('subscribing to array++ of listeners');
        const unsubscribe = () => {
            const index = listeners.indexOf(fn);
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
 * @param {Set<function>} listeners set of state listeners that updates on state updates
 */
function scheduleEffect(listeners) {
    console.time('scheduleEffect');
    const effect = effects.last();
    // effect && console.log('runListenerEffect', { effect });
    if (effect) {
        const unsubscribe = subscribe(listeners, effect);
        unsubscribes.add(unsubscribe);
        console.log('unsubscribes', { unsubscribes });
    }
    console.timeEnd('scheduleEffect');
}

/**
 * # createReactive
 * 
 * @description a method with automatic subscription and effect scheduling * 
 * @param {*} initialValue the initial value for the state * 
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
    const listeners = new Set();

    function read() {
        scheduleEffect(listeners);
        // console.log('read', { fx: effects.entries(), listeners });
        return state;
    }

    /**
     * dispatch
     *
     * @param {*|function} newValue update state with `newValue`
     */
    function dispatch(newValue) {
        const prevState = state;
        const currentState =
            checkType(newValue) === 'function' ? newValue() : newValue;
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
 * @param {object} value - the initial state represented as an object
 * @returns
 */
export function store(value) {
    let state = value;
    let prevState = null;
    const listeners = new Set();
    /**
     *
     * @param {string} [key] - optional key defined on state object
     * @returns
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
     * @param {object|fn} value - state changes represented either by a new object directly or as result by a function
     * @returns
     */
    const setStore = (key, value) => {
        if (key && typeof key !== 'string') {
            createError(`Value must be of type 'String'!`, TypeError);
        }
        prevState = state;
        const valueType = checkType(value);
        if (valueType === 'function') {
            const fn = value;
            state[key] = fn(prevState[key]);
            return;
        }
        state = {
            ...prevState,
            [key]:
                valueType === 'object'
                    ? (Object.hasOwn(prevState, key) && {
                          ...prevState[key],
                          ...value,
                      }) || { [key]: { ...value } }
                    : valueType === 'array'
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
 * @param {*} value 
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
 * @param {function} fn a callback function that runs whenever the state updates
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
    console.time('effect');
    const run = (prevState, currentState) => {
        effects.clear();
        // effects.add(fn);
        subscribe(effects, fn);
        // console.log({ effects: effects.entries() });
        try {
            fn(prevState, currentState);
        } /* catch (error) {
            console.log(error);
        } */ finally {
            effects.entries().pop();
        }
    };
    run();
    console.timeEnd('effect');
}

export const createEffect = effect;
export const makeEffect = effect;
export const useEffect = effect;

function createReactiveRoot() {}

/**
 * # onChange
 *
 * @typedef {{added: [], removed: [], modified: []}} results - foobar
 * @typedef {*} prevState
 * @typedef {*} currentState
 * @param {prevState} prev previous state
 * @param {currentState} current current state
 * @param {(results)} fn callback
 * @returns {results|function(results)}
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

    if (fn && typeof fn === 'function') {
        return fn(results);
    }

    return results;
}

/**
 * # memo
 *
 * @param {function} fn
 * @returns {*} result
 */
export function memo(fn = () => {}) {
    if (!fn || fn === null || typeof fn !== 'function') {
        return createError(
            'memo: expected argument to be a function',
            TypeError
        );
    }
    // const cache = new WeakMap();
    const cache = new Map();
    const ref = (...args) => {
        const key = JSON.stringify(...args);
        // const key = [...args];
        console.log('memo: key', key);
        if (cache.has(key)) {
            console.log('memo: getting cached value');
            return cache.get(key);
        }
        const result = fn(...args);
        console.log('memo: adding result to cache');
        cache.set(key, result);
        return result;
    };
    ref.cache = cache;
    return ref;
}

export const createMemo = memo;
export const makeMemo = memo;
export const useMemo = memo;

console.timeEnd('state');
