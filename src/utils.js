import { createError } from './error.js';

/**
 * delay
 *
 * delay execution of a function/method
 *
 * @param {function} fn - function to execute later
 * @param {number} timeout - amount of timeout in milliseconds
 * @param {...any} args - arguments to pass on to fn
 */
export function delay(fn, timeout, ...args) {
    return setTimeout(() => {
        return fn.apply(null, args);
    }, timeout);
}

/**
 * debounce
 *
 * Only execute a function/method within a certain amount of time.
 * Useful to avoid doing unecessary work that impacts performance.
 * Will only be used on internal methods and not exposed in the public API.
 *
 * http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 *
 * @param {function} fn - function to debounce
 * @param {number} treshold - value in milliseconds
 * @param {boolean} asap - fn should execute asap or not
 */
export function debounce(fn, treshold = 100, asap = false) {
    let timeout;

    return function debounced(...args) {
        const delayed = () => {
            if (!asap) {
                fn.apply(debounced, args);
            }
            timeout = null;
        };

        if (timeout) {
            clearTimeout(timeout);
        } else if (asap) {
            fn.apply(debounced, args);
        }

        timeout = delay(delayed, treshold);
    };
}

/**
 * debounceRAF
 *
 * @param {function} fn - function to debounce
 */
export function debounceRAF(fn) {
    let timeout;

    return function debounced(...args) {
        if (timeout) {
            window.cancelAnimationFrame(timeout);
        }

        timeout = window.requestAnimationFrame(() => {
            return fn.apply(null, args);
        });
    };
}

/**
 * checkType
 *
 * A more reliable way of checking type of values.
 *
 * @param {*} value - value to check type of
 */
export function checkType(value = null) {
    const sliceStart = 8;
    const sliceEnd = -1;

    return Object.prototype.toString
        .call(value)
        .slice(sliceStart, sliceEnd)
        .toLowerCase();
}

/**
 * traverseChildNodes
 *
 * @param {HTMLElement} parent
 * @param {function} callback
 */
export function traverseChildNodes(parent = null, callback = () => {}) {
    if (!parent) {
        return createError(
            `Expected parent parameter to be set, was ${parent}`
        );
    }

    const childCount = parent.childNodes.length;
    const elementHasChildren = childCount > 0;

    if (elementHasChildren) {
        for (const child of parent.childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const childHasChildNodes = child.childNodes.length > 0;
                if (childHasChildNodes) {
                    traverseChildNodes(child, (childChild) => {
                        callback(childChild);
                    });
                }

                callback(child);
            }
        }
    }
}

/**
 * createArray
 * 
 * @param  {...any} items items to spread into a new array
 * @example
 * 
    // methods
    const nums = createArray(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    nums.get(1), // 2
    nums.add(11), // 11
    nums.remove(5), // [6]
    nums.entries(), // [1,2,3,4,5,6,7,8,9,10,11]
    nums.clear(), // true
    nums.entries() // []

    // iterate
    const arr = createArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    for (const item of arr) {
        console.log(item);
    }
 */
export function createArray(...items) {
    const arr = [...items];
    let count = 0;
    const prototype = {
        get(index) {
            return arr[index];
        },
        first() {
            return prototype.get(0);
        },
        last() {
            console.log('createArrray', { count });
            return prototype.get(arr.length - 1);
        },
        add(item) {
            return arr.push(item);
        },
        remove(index) {
            return arr.splice(index, 1);
        },
        clone() {
            return [...arr];
        },
        entries() {
            return arr;
        },
        clear() {
            if (arr.length > 0) {
                arr.length = 0;
                count = 0;
                return true;
            }

            return false;
        },
        *[Symbol.iterator]() {
            yield prototype.get(count);
            count++;
        },
        get [Symbol.toStringTag]() {
            return 'array++';
        },
    };
    return prototype;
}

/* 

createLocalStorage
================================================

const initialTasks = [
    { value: 'first', completed: false },
    { value: 'second', completed: true },
    { value: 'third', completed: false },
];
const db = createLocalStorage('tasks', initialTasks);
const [tasks, setTasks] = createSignal(db.read());

createEffect(() => {
    db.write(tasks());
});

*/

/**
 * # createPersistedStorage
 *
 */
async function createPersistedStorage() {
    if (navigator.storage && navigator.storage.persisted) {
        await navigator.storage.persisted();
        return {
            async grant() {
                await navigator.storage.persist();
            },
        };
    }
}

/**
 * # createLocalStorage
 *
 * @param {string} key
 * @param {*} initialData
 * @returns
 */
export function createLocalStorage(key = 'app', initialData = null) {
    createPersistedStorage()
        .then(({ grant }) => {
            const granted = grant();
            console.log('Granted persisted storage?', granted ? 'yes' : 'no');
        })
        .catch((err) => console.log(err));

    return {
        read() {
            const parsed = JSON.parse(localStorage.getItem(key));
            const dataType = checkType(parsed);
            console.log({ dataType });
            if (
                (parsed === null && initialData !== null) ||
                (dataType === 'array' && parsed.length === 0)
            ) {
                return initialData;
            }
            return parsed;
        },
        write(data) {
            localStorage.setItem(key, JSON.stringify(data));
        },
    };
}

/**
 * # isEqual
 *
 * @param {(Array|Object)} first
 * @param {Array} second
 * @returns
 */
export function isEqual(first, second) {
    if (typeof first !== 'object' || typeof second !== 'object') {
        return false;
    }

    if (Array.isArray(first) !== Array.isArray(second)) {
        return false;
    }

    const firstKeys = Object.keys(first);
    const secondKeys = Object.keys(second);

    if (firstKeys.length !== secondKeys.length) {
        return false;
    }

    for (let i = 0; i < firstKeys.length; i++) {
        const key = firstKeys[i];

        if (!Object.hasOwn(second, key)) {
            return false;
        }

        const firstValue = first[key];
        const secondValue = second[key];

        if (typeof firstValue === 'object' && typeof secondValue === 'object') {
            if (!isEqual(firstValue, secondValue)) {
                return false;
            }
        } else if (firstValue !== secondValue) {
            return false;
        }
    }

    return true;
}

/* const tests = new Set();

function test(msg, fn) {
    tests.add({ msg, fn });
} */

/* {
    console.log('object equality');
    console.log('objects', isEqual({ value: 1 }, { value: 1 }));
    console.log(
        'deep objects',
        isEqual(
            { value: 1, deep: { value: 2 } },
            { value: 1, deep: { value: 2 } }
        ),
        'deeper same',
        isEqual(
            { value: 1, deep: { value: 2, deeper: { value: 3 } } },
            { value: 1, deep: { value: 2, deeper: { value: 3 } } }
        ),
        'deeper different',
        isEqual(
            { value: 1, deep: { value: 2, deeper: { value: 3 } } },
            { value: 1, deep: { value: 2, deeper: { value: 4 } } }
        ),
        'contains arrays same',
        isEqual({ value: [1, 2, 3, 4, 5] }, { value: [1, 2, 3, 4, 5] }),
        'deep with arrays',
        isEqual(
            { value: [1, 2, 3, 4, 5], deep: { items: [1, 2, 3, 4, 5] } },
            { value: [1, 2, 3, 4, 5], deep: { items: [1, 2, 3, 4, 5] } }
        )
    );
    console.log('array equality');
    console.log('arrays', isEqual([1, 2, 3], [1, 2, 3]));
    console.log('nested arrays', isEqual([[1], [2], [3]], [[1], [2], [3]]));
    console.log(
        'arrays with objects',
        isEqual([{ value: 1 }, { value: 2 }], [{ value: 1 }, { value: 2 }])
    );
    console.log('arrays with different length', isEqual([1, 2, 3], [1, 2]));
    console.log('arrays with different values', isEqual([1, 2, 3], [1, 4, 3]));
    console.log(
        'same',
        isEqual(
            { a: 1, b: 2, c: { d: 3, e: { f: 4 } } },
            { a: 1, b: 2, c: { d: 3, e: { f: 4 } } }
        )
    );
    console.log(
        'different',
        isEqual(
            { a: 1, b: 2, c: { d: 3, e: { f: 4 } } },
            { a: 1, b: 2, c: { d: 3, e: { f: 5 } } }
        )
    );
    console.log(
        'different',
        isEqual(
            { a: 1, b: 2, c: { d: 3, e: { f: 4 } } },
            { a: 1, b: 2, c: { d: 3, e: { g: 4 } } }
        )
    );
    console.log(
        'different',
        isEqual(
            { a: 1, b: 2, c: { d: 3, e: { f: 4 } } },
            { a: 1, b: 2, c: { d: 3, f: { e: 4 } } }
        )
    );
    console.log(
        'different',
        isEqual(
            { a: 1, b: 2, c: { d: 3, e: { f: 4 } } },
            { a: 1, b: 2, c: { d: 3 } }
        )
    );
    console.log(
        'different',
        isEqual(
            { a: 1, b: 2, c: { d: 3, e: { f: 4 } } },
            { a: 1, b: 2, d: { e: 3, f: { g: 4 } } }
        )
    );
} */
