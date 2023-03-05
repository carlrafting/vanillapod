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
