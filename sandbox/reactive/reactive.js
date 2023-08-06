/* const reactiveState = {};

const subscribers = new Set();

function addSubscriber(subscriber) {
    subscribers.add(subscriber);
    return subscriber;
}

function removeSubscriber(subscription) {
    subscribers.delete(subscription);
}

function notifySubscribers() {
    for (const subscriber of subscribers) {
        subscriber(reactiveState);
    }
}

function createReactiveState(initialState = {}) {
    const state = {};
    for (const [key, value] of Object.entries(initialState)) {
        let _value = value;
        const getters = new Set();
        const setters = new Set();
        const get = () => _value;
        const set = newValue => {
            if (_value !== newValue) {
                _value = newValue;
                notifySubscribers();
                for (const setter of setters) {
                    setter(newValue);
                }
            }
        };
        const subscribe = (getter, setter) => {
            getters.add(getter);
            setters.add(setter);
            return () => {
                getters.delete(getter);
                setters.delete(setter);
            };
        };
        const propertyDescriptor = {
            get,
            set,
            configurable: true,
            enumerable: true
        };
        Object.defineProperty(state, key, propertyDescriptor);
        Object.defineProperty(reactiveState, key, {
            get,
            set,
            configurable: true,
            enumerable: true
        });
    }
    return state;
}

function createComputedValue(computeFn) {
    let value = null;
    const getters = new Set();
    const setters = new Set();
    const compute = () => {
        const proxy = new Proxy({}, {
            get(target, key) {
                return reactiveState[key].get();
            }
        });
        const newValue = computeFn(proxy);
        if (newValue !== value) {
            value = newValue;
            for (const setter of setters) {
                setter(newValue);
            }
        }
    };
    const subscribe = (getter, setter) => {
        getters.add(getter);
        setters.add(setter);
        compute();
        return () => {
            getters.delete(getter);
            setters.delete(setter);
        };
    };
    return {
        get() {
            return value;
        },
        subscribe,
        unsubscribe() {
            getters.clear();
            setters.clear();
        }
    };
}

function createEffect(effectFn) {
    const subscriber = reactiveState => effectFn(reactiveState);
    return addSubscriber(subscriber);
}

// Example usage
const state = createReactiveState({
    count: 0,
});
  
const doubleCount = createComputedValue(proxy => {
    return proxy.count * 2;
});
  
const unsubscribeDoubleCount = doubleCount.subscribe(() => {
    console.log(`doubleCount changed: ${doubleCount.get()}`);
});
  
createEffect(reactiveState => {
    console.log(`count: ${reactiveState.count}, doubleCount: ${doubleCount.get()}`);
});
  
console.log(`initial count: ${state.count}`);
  
increment();
increment();
increment();
decrement();
  
console.log(`count after updates: ${state.count}`);
 */

let activeEffect = null;

function notifySubscribers(subscribers) {
    subscribers.forEach((callback) => callback());
}

function subscribe(subscribers, callback) {
    subscribers.add(callback);
    return function unsubscribe() {
        subscribers.delete(callback);
    };
}

// create a factory function for reactive states
function createReactiveState(initialValue) {
    let value = initialValue;
    const subscribers = new Set();

    function write(newValue) {
        value = newValue;
        notifySubscribers(subscribers);
    }

    function read() {
        if (activeEffect) {
            subscribers.add(activeEffect);
        }
        return value;
    }

    return { write, read, subscribe };
}

// create a factory function for computed values
function createComputedValue(computeFn) {
    const subscribers = new Set();
    let value = null;

    function get() {
        if (activeEffect) {
            subscribers.add(activeEffect);
        }
        if (value === null) {
            value = computeFn();
        }
        return value;
    }

    return { get, subscribe };
}

// create a factory function for effects
function createEffect(dependencies, effectFn) {
    let cleanupFn = () => {};

    function runEffect() {
        const args = dependencies.map((dep) => dep.get());
        cleanupFn = effectFn(...args) || (() => {});
    }

    function cleanupEffect() {
        cleanupFn();
    }

    dependencies.forEach((dep) => {
        dep.subscribe(runEffect);
    });

    runEffect();

    return { cleanup: cleanupEffect };
}

// example usage
const counter = createReactiveState(0);
const multiplier = createReactiveState(2);

const computedValue = createComputedValue(
    [counter, multiplier],
    (c, m) => c * m
);

const effect = createEffect([computedValue], (value) => console.log(value));

counter.write(1);
// output: 1

multiplier.write(3);
// output: 3

counter.write(2);
// output: 3

// cleanup the effect when no longer needed
effect.cleanup();
