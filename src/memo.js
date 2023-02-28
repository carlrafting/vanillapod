const cache = new Map();

export function memo(fn = () => {}) {
    if (typeof fn !== 'function') throw Error('memo: expected function as argument');
    const result = fn();
    if (cache.has(result)) {
        console.log('memo: getting cached value');
        return cache.get(result);
    }
    console.log('memo: adding result to cache');
    cache.set(result, [result, fn]);
    // return result;
}
