const bcrypt = require('bcrypt');
const crypto = require('crypto');
const ProvideException = require('../utils/provider.exception.js');

module.exports = {
  /*
   * Passwords should be compared with encrypted password to prevents security
   * vulnerabilities.
   */
  matchPassword({password, comparePassword}) {
    return bcrypt.compareSync(password, comparePassword);
  },

  matchConfirmPassword(password, confirmPassword) {
    return password === confirmPassword;
  },

  isStrongPassword(password) {
    return password.length >= 8;
  },

  generateHash(length) {
    return crypto.randomBytes(length).toString('hex');
  },

  hashPassword(password) {
    return bcrypt.hashSync(password, 10);
  },

  generateExpiredTimeByHour() {
    const timeExpired = new Date();
    timeExpired.setHours(timeExpired.getHours() + 1);

    return timeExpired;
  },

  validateMissingFields(fields) {
    Object.entries(fields).map(field => {
      const fieldValue = field.pop();
      const fieldName = field.shift();

      if (typeof fieldValue !== 'boolean' && !fieldValue) {
        throw new ProvideException(fieldName, `${fieldName} não pode ser vazio`);
      }
    });
  },
};