let activeEffect = null;

function notifySubscribers(subscribers) {
    subscribers.forEach(callback => callback());
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

    return { set: write, get: read, subscribe };
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
    let cleanupFn = () => { };

    function runEffect() {
        const args = dependencies.map(dep => dep.get());
        cleanupFn = effectFn(...args) || (() => { });
    }

    function cleanupEffect() {
        cleanupFn();
    }

    dependencies.forEach(dep => {
        dep.subscribe(runEffect);
    });

    runEffect();

    return { cleanup: cleanupEffect };
}

// example usage
const counter = createReactiveState(0);
const multiplier = createReactiveState(2);

const computedValue = createComputedValue([counter, multiplier], (c, m) => c * m);

const effect = createEffect([computedValue], value => console.log(value));

counter.set(1);
// output: 2

multiplier.set(3);
// output: 3

counter.set(2);
// output: 6

// cleanup the effect when no longer needed
effect.cleanup();
