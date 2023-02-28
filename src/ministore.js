export function store(initialState) {
    let state = initialState;
    const listeners = [];

    function notifyListeners() {
        listeners.forEach((listener) => listener(state));
    }

    function read() {
        return state;
    }

    function dispatch(action) {
        state = action(state);
        notifyListeners();
    }

    function subscribe(listener) {
        listeners.push(listener);

        return function unsubscribe() {
            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
        };
    }

    return { read, dispatch, subscribe };
}

export const useStore = store;
export const makeStore = store;
export const createStore = store;
