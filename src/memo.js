import { createError } from './error.js';

const cache = new Map();

export function memo(fn = () => {}) {
    if (typeof fn !== 'function') {
        createError('memo: expected function as argument');
    }
    return (...args) => {
        const key = JSON.stringify(args);
        // console.log('memo: key', key);
        if (cache.has(key)) {
            // console.log('memo: getting cached value');
            return cache.get(key);
        }
        const result = fn(...args);
        // console.log('memo: adding result to cache');
        cache.set(key, result);
        return result;
    };
}

export const createMemo = memo;
export const makeMemo = memo;
export const useMemo = memo;
