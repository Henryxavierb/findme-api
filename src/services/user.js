const bcrypt = require('bcrypt');
const crypto = require('crypto');
const ProvideException = require('../utils/provider.exception.js');

module.exports = {
  /*
   * Passwords should be compared with encrypted password to prevents security
   * vulnerabilities.
   */
  matchPassword({comparePassword, password}) {
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
    fields.map(field => {
      if (!field) {
        const fieldName = Object.keys({field})[0];
        throw new ProvideException(`${fieldName}`, `${fieldName} não pode ser vazio`);
      }
    });
  },
};