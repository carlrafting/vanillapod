import debug from './debug.js';

const errors = new Set();

export function createError(message = '', exception = Error) {
    if (debug()) {
        if (message !== '') {
            throw new exception(message);
        }
    }

    errors.add({ exception: message, type: exception });
}

export function logErrors() {
    for (const err of [...errors]) {
        console.log(err);
    }
}

function captureErrors(fn) {
    try {
        fn();
    } catch (err) {
        console.log('catch block', err);
    }
}

/* captureErrors(() => {
    // debug(true);
    createError('Something went wrong!');
    createError('Something went wrong again!');
    createError('Some reference error', ReferenceError);
    logErrors();
});
 */
