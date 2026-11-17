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
  /**
   * @type {ReturnType<typeof setTimeout> | null | undefined}
   */
  let timeout;

  return function debounced(/** @type {any[]} */ ...args) {
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
  /**
   * @type {number}
   */
  let timeout;

  return function debounced(/** @type {any[]} */ ...args) {
    if (timeout) {
      globalThis.cancelAnimationFrame(timeout);
    }

    timeout = globalThis.requestAnimationFrame(() => {
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
 * @param {HTMLElement | null} [parent]
 * @param {(node: any) => void} [callback]
 */
export function traverseChildNodes(parent = null, callback = () => {}) {
  if (!parent) {
    throw new Error(
      `Expected parent parameter to be set, was ${parent}`,
    );
  }

  const childCount = parent.childNodes.length;
  const elementHasChildren = childCount > 0;

  if (elementHasChildren) {
    for (const child of parent.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childHasChildNodes = child.childNodes.length > 0;
        if (childHasChildNodes) {
          traverseChildNodes(
            /** @type {HTMLElement} */ (child),
            (/** @type {any} */ childChild) => {
              callback(childChild);
            },
          );
        }

        callback(child);
      }
    }
  }
}

/**
 * createPersistedStorage
 *
 * @returns {Promise<{
 *  grant(): Promise<void>;
 * } | undefined>}
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
 * createLocalStorage
 *
 * @param {string} key
 * @param {*} initialData
 * @returns
 */
export function createLocalStorage(key = "app", initialData = null) {
  createPersistedStorage()
    .then((storage) => {
      const granted = storage?.grant();
      console.log("Granted persisted storage?", granted ? "yes" : "no");
    })
    .catch((err) => console.log(err));

  return {
    read() {
      const parsed = JSON.parse(localStorage.getItem(key) ?? "null");
      const dataType = checkType(parsed);
      console.log({ dataType });
      if (
        (parsed === null && initialData !== null) ||
        (dataType === "array" && parsed.length === 0)
      ) {
        return initialData;
      }
      return parsed;
    },
    /**
     * @param {any} data
     */
    write(data) {
      localStorage.setItem(key, JSON.stringify(data));
    },
  };
}

/**
 * @param {{ [x: string]: any; }} first
 * @param {{ [x: string]: any; }} second
 */
export function isEqual(first, second) {
  if (typeof first !== "object" || typeof second !== "object") {
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

    if (typeof firstValue === "object" && typeof secondValue === "object") {
      if (!isEqual(firstValue, secondValue)) {
        return false;
      }
    } else if (firstValue !== secondValue) {
      return false;
    }
  }

  return true;
}
