/**
 * Type checking helpers.
 */

const toString = arg => Object.prototype.toString.call(arg);

export const isUndef = arg => arg === void 0;

export const isString = arg => typeof arg === 'string';

export const isFunction = arg => typeof arg === 'function';

export const isObject = arg => typeof arg === 'object' && arg !== null;

export const isPlainObject = arg => toString(arg) === '[object Object]';

export const isArray = arg => Array.isArray(arg);

export const isError = arg => isObject(arg) &&
    (toString(arg) === '[object Error]' || arg instanceof Error);
