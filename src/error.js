import debug from './debug.js';

// only throw errors when debug is enabled
//
// usage:
//
// import error from 'error';
//
// throw standard error
// error(new Error('This is my Error message'));
//
// throw reference error
// error(new ReferenceError('This is my ReferenceError message'))
//
// throw custom exception
// function CustomException() {}
// error(new CustomException('This is my CustomException message'))

const errors = [];

export default (exception) => {
    if (debug()) {
        throw exception;
    }

    errors[exception.name] = { exception };
};