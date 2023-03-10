import { createError } from './error.js';

export function ministore(initialValue) {
    let value = initialValue;
    const listeners = new Set();

    function notifyListeners() {
        if (listeners.size === 0) {
            createError('No listeners registered!');
        }
        listeners.forEach((listener) => listener(value));
    }

    function read() {
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

/* function subscribe(running, listeners) {
    listeners.add(running);
    running.dependencies.add(running);
} */

const context = [];

export function signal(value) {
    const listeners = new Set();
    const subscribe = (running) => {
        listeners.add(running);
        running.dependencies.add(running);
    };
    const read = () => {
        const running = context[context.length - 1];
        // console.log({ running });
        if (running) subscribe(running);
        return value;
    };
    const notify = () => {
        for (const l of [...listeners]) {
            l.execute();
        }
    };
    const write = (nextValue) => {
        value = nextValue;
        notify();
    };
    return [read, write];
}

export const createSignal = signal;
export const useSignal = signal;
export const makeSignal = signal;

function cleanup(running) {
    for (const dep of running.dependencies) {
        console.log({ dep });
        dep.dependencies.delete(running);
    }
    running.dependencies.clear();
}

export function effect(fn) {
    const running = {
        execute() {
            // 1. cleanup
            cleanup(running);
            // 2. push effect to context
            context.push(running);
            try {
                // 3. execute callback fn
                fn();
            } catch (error) {
                console.error(error);
            } finally {
                // 4. pop the last element from the context array
                context.pop();
            }
        },
        dependencies: new Set(),
    };
    running.execute();
}

export const createEffect = effect;
export const makeEffect = effect;
export const useEffect = effect;

/* const [count, setCount] = signal(0);
createEffect(() => console.log(count()));
setCount(count() + 1);
setCount(count() * 3); */
