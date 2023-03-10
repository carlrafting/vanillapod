import { createError } from './error';

export function ministore(initialValue) {
    let value = initialValue;
    const listeners = new Set();

    function notifyListeners() {
        if (listeners.size === 0) {
            createError('No listeners registered');
        }
        listeners.forEach((listener) => listener(value));
    }

    function read() {
        const running = [...listeners][listeners.size - 1];
        console.log({ running });
        /* running && */ subscribe(running);
        return value;
    }

    function dispatch(action) {
        value = typeof action === 'function' ? action(value) : action;
        notifyListeners();
    }

    function subscribe(listener) {
        listeners.add(listener);

        return function unsubscribe() {
            listeners.delete(listener);
        };
    }

    return { read, dispatch, subscribe };
}

export const store = ministore;
export const useStore = ministore;
export const makeStore = ministore;
export const createStore = ministore;

export function signal(value) {
    const s = store(value);
    return [s.read, s.dispatch, s.subscribe];
}

export const createSignal = signal;
export const useSignal = signal;
export const makeSignal = signal;
