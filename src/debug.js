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

export function createDebug(name = '') {
    const __proto__ = (method = '') => ({
        enable() {
            VANILLAPOD_DEBUG = true;
        },
        disable() {
            VANILLAPOD_DEBUG = false;
        },
        log(...output) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(timestamp, name, method, ...output);
        },
    });
    return __proto__;
}
