require("dotenv").config();
const moment = require("moment");
const jwt = require("jsonwebtoken");
const sgMailer = require('@sendgrid/mail');
const { template } = require("./template");

module.exports = {
  validateDate(endDate, beginDate) {
    const endDateFormat = moment(endDate);
    const beginDateFormat = moment(beginDate);

    return endDateFormat.diff(beginDateFormat, "minutes") >= 1 || false;
  },

  generateToken(params = {}) {
    return jwt.sign(params, process.env.SECRET_TO_ACCESS_TOKEN);
  },

  tokkenAuthorization(request, response, next) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return response.json({ validation: "No token provided" });
    }

    jwt.verify(authHeader, process.env.SECRET_TO_ACCESS_TOKEN, (err, decoded) => {
      if (err) return response.json({ validation: "Token invalid" });

      request.user_id = decoded.id;
      return next();
    });
  },

  // Pass expired token and user ID to URL
  // Change LINK to mobile deeplink
  async sendEmail(expiredToken, recipient, userName) {
    sgMailer.setApiKey(process.env.SENDGRID_API_KEY)
    
    return sgMailer.send({
      to: recipient,
      from: process.env.SENDER_EMAIL,
      subject: 'Redefinição de senha',
      html: template(expiredToken, userName)
    }, err => err)
  },
};
