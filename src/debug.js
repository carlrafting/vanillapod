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

    return (VANILLAPOD_DEBUG = value);
}
