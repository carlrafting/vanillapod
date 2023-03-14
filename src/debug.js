let VANILLAPOD_DEBUG = false;

/**
 * debug
 *
 * @param {boolean} value - enable or disable debug output
 */
export default function debug(value = false) {
    if (!value) {
        return VANILLAPOD_DEBUG;
    }

    if (typeof value === 'boolean') VANILLAPOD_DEBUG = value;
}

function createDebug(name = '') {
    return (method = '') => ({
        enable() {
            VANILLAPOD_DEBUG = true;
        },
        disable() {
            VANILLAPOD_DEBUG = false;
        },
        log(...output) {
            console.log(new Date().toISOString(), name, method, ...output);
        },
    });
}

{
    const debug = createDebug('vanillapod');
    debug('mymethod').log('example');
    const results = performance.measure('perf', () => {
        const arr = [];
        for (let i = 0; i < 1000; i += 1) {
            arr.push(i);
        }
    });
    debug('perf').log(results);
}
