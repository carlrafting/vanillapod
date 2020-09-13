export default function debug(value=false) {
    if (!value) {
        return window.CEVJS_DEBUG;
    }

    return window.CEVJS_DEBUG = value;
}
