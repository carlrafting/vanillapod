/**
 * createError
 *
 * Throws `exception` when debug mode is enabled, otherwise records the error
 * silently (see `logErrors`).
 *
 * @param {string} [message] - error message
 * @param {ErrorConstructor} [exception] - error constructor to throw, defaults to `Error`
 * @returns {undefined}
 */
export function createError(message?: string, exception?: ErrorConstructor): undefined;
/**
 * logErrors
 *
 * Logs all errors recorded by `createError`.
 *
 * @returns {void}
 */
export function logErrors(): void;
