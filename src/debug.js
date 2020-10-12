/**
 * debug
 * 
 * @param {boolean} value - enable or disable debug output
 */
export default function debug(value=false) {
    if (!value) {
        return window.VANILLAPOD_DEBUG;
    }

    return window.VANILLAPOD_DEBUG = value;
}
