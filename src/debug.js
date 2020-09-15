export default function debug(value=false) {
    if (!value) {
        return window.VANILLAPOD_DEBUG;
    }

    return window.VANILLAPOD_DEBUG = value;
}
