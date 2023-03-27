import debug from './debug.js';
import { createError } from './error.js';
import { createArray, checkType } from './utils.js';

/**
 * @module state
 */

console.time('state');

const effects = createArray([]);

/**
 * @param {Set<function|array>} [listeners] set of state listeners that updates on state updates
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
 *
 * @param {Set} listeners
 * @param {function} fn
 * @returns {function} unsubscribe function
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
 * @param {Set<function>} [listeners] set of state listeners that updates on state updates
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
 * @exports state/store
 * @exports state/useStore
 * @exports state/makeStore
 * @exports state/createStore
 * @param {string|number|boolean|array|object} [initialValue] the initial value for the state * 
 * @example
 *  
    // create reactive message state and read current state
    const message = store('');
    message.dispatch('...');
    message(); // '...'
    message.dispatch('Hello World!');
    message(); // 'Hello World'

    // create reactive count state and subscribe to state updates
    const count = store(0);
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
     * @param {any|function} [action]
     */
    function dispatch(action) {
        const prevState = state;
        const currentState =
            checkType(action) === 'function' ? action() : action;
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

export const store = createReactive;
export const useStore = createReactive;
export const makeStore = createReactive;
export const createStore = createReactive;

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
    const s = store(value);
    return [s.read, s.dispatch];
}

export const createSignal = signal;
export const useSignal = signal;
export const makeSignal = signal;

/**
 * # effect
 *
 * @param {function} [fn] a callback function that runs whenever the state updates
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
        } catch (error) {
            console.log(error);
        } finally {
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

console.timeEnd('state');
