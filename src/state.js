function createStateHandler() {
    return {
        get(obj, prop) {
            if (['object Object', 'object Array'].indexOf(Object.prototype.toString.call(obj[prop])) > -1) {
                return new Proxy(obj[prop], createStateHandler());
            }

            return obj[prop];
        },
        set(obj, prop, value) {
            obj[prop] = value;

            return true;
        },
        deleteProp(obj, prop) {
            delete obj[prop];

            return true;
        }
    };
}

export function useState(state) {
    const stateHandler = createStateHandler();
    const data = new Proxy(state, stateHandler);

    return data;
}
