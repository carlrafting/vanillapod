import debug from './debug.js';
import { createError } from './error.js';
import { createArray, checkType } from './utils.js';

/*

Usage:
===========================================

const count = store(0);

count.subscribe(function logCount() {
    console.log(count.read());
});
count.dispatch(count.read() + 1);
count.dispatch(count.read() + 3);

const message = store('');
effect(function logMessage() {
    console.log(message.read());
});
message.dispatch('...');
message.dispatch('Hello World!');

const [counter, setCounter] = createSignal(0);
createEffect(() => {
    console.log(counter())
});
setCounter(counter() + 3)
setTimeout(() => setCounter(counter() * 6), 1000);

*/

console.time('state');

const effects = createArray([]);

debug('foo');
console.log('debug', debug());

function notify(listeners, value) {
    console.time('notify');
    if (listeners.size === 0) {
        createError('state: No listeners registered!');
    }
    for (const listener of listeners) {
        // console.log('notifyListeners', listener);
        if (listener && checkType(listener) === 'function') listener(value);
    }
    console.timeEnd('notify');
}

function subscribe(listeners, fn) {
    console.time('subscribe');
    listeners.add(fn);
    console.timeEnd('subscribe');
    return function unsubscribe() {
        listeners.delete(fn);
    };
}

const unsubscribes = new Set();

function scheduleEffect(listeners) {
    console.time('scheduleEffect');
    const effect = effects.last();
    // effect && console.log('runListenerEffect', { effect });
    if (effect) {
        const unsubscribe = subscribe(listeners, effect);
        unsubscribes.add(unsubscribe);
        // console.log('unsubscribeFns', { unsubscribeFns });
    }
    console.timeEnd('scheduleEffect');
}

// a ministore method with automatic subscription and effect scheduling
export function ministore(initialValue) {
    let value = initialValue;
    const listeners = new Set();

    function read() {
        scheduleEffect(listeners);
        // console.log('read', { fx: effects.entries(), listeners });
        return value;
    }

    function dispatch(action) {
        value = checkType(action) === 'function' ? action(value) : action;
        notify(listeners, value);
    }

    return {
        read,
        dispatch,
        subscribe: (fn) => effect(fn),
    };
}

export const store = ministore;
export const useStore = ministore;
export const makeStore = ministore;
export const createStore = ministore;

function effect(fn) {
    // console.log('createListenerEffect:', effects.entries());
    console.time('effect');
    const run = () => {
        effects.clear();
        effects.add(fn);
        console.log({ effects: effects.entries() });
        try {
            fn();
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

// a thin wrapper around store method with an api similar to solid.js
export function signal(value) {
    const s = store(value);
    return [s.read, s.dispatch];
}

export const createSignal = signal;
export const useSignal = signal;
export const makeSignal = signal;

console.timeEnd('state');
