require('dotenv').config();
const moment = require('moment');
const jwt = require('jsonwebtoken');
const sendgridMailer = require('@sendgrid/mail');
const {emailTemplate} = require('./email.template.js');

module.exports = {
  /*
   * Missing fix
   */
  // validateDate(endDate, beginDate) {
  //   const endDateFormat = moment(endDate);
  //   const beginDateFormat = moment(beginDate);
  //
  //   return endDateFormat.isSameOrBefore(beginDateFormat);
  // },

  generateToken(params = {}) {
    return jwt.sign(params, process.env.SECRET_TO_ACCESS_TOKEN);
  },

  /*
   * Missing fix
   */
  // tokkenAuthorization(request, response, next) {
  //   const authHeader = request.headers.authorization;
  //
  //   if (!authHeader) {
  //     return response.json({validation: 'No token provided'});
  //   }
  //
  //   jwt.verify(authHeader, process.env.SECRET_TO_ACCESS_TOKEN, (err, decoded) => {
  //     if (err) return response.json({validation: 'Token invalid'});
  //
  //     request.user_id = decoded.id;
  //     return next();
  //   });
  // },

  async sendEmail({accessToken, recipient, userName}) {
    sendgridMailer.setApiKey(process.env.SENDGRID_API_KEY);

    return sendgridMailer.send({
      to: recipient,
      from: process.env.SENDER_EMAIL,
      subject: 'Redefinição de senha',
      html: emailTemplate(accessToken, userName),
    }, err => err);
  },
};
