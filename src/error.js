import debug from './debug.js';

let errors = [];

export { errors };

/**
 * error
 * 
 * throw standard error:
 * error(new Error('This is my Error message'));
 * 
 * throw reference error:
 * error(new ReferenceError('This is my ReferenceError message'))
 * 
 * throw custom exception:
 * function CustomException() {}
 * error(new CustomException('This is my CustomException message'))
 * 
 * @param {Error} exception - throw error when debug is enabled, otherwise store in errors array
 */
export default (exception) => {
    if (debug()) {
        throw exception;
    }

    errors[exception] = { exception };

    return;
};
