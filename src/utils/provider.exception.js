/*
 * We can send field name and message to front-end validate which field doesn't match
 */

module.exports = class ProvideException extends Error {
  constructor(field, message) {
    super();
    this.field = field;
    this.message = message;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  };
};