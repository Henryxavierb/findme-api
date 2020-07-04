require("dotenv").config();
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { template } = require("./template");
const nodemailer = require("nodemailer");

module.exports = {
  validateDate(endDate, beginDate) {
    const endDateFormat = moment(endDate);
    const beginDateFormat = moment(beginDate);

    return endDateFormat.diff(beginDateFormat, "minutes") >= 1 || false;
  },

  generateToken(params = {}) {
    return jwt.sign(params, process.env.SECRET);
  },

  tokkenAuthorization(request, response, next) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return response.json({ validation: "No token provided" });
    }

    jwt.verify(authHeader, process.env.SECRET, (err, decoded) => {
      if (err) return response.json({ validation: "Token invalid" });

      request.user_id = decoded.id;
      return next();
    });
  },

  // Pass expired token and user ID to URL
  // Change LINK to mobile deeplink
  async sendEmail(expiredToken, recipient, userName) {
    return await nodemailer
      .createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      })
      .sendMail({
        from: process.env.SENDER,
        to: recipient,
        subject: "Redifinição de senha",
        html: template(expiredToken, userName),
      })
      .then((response) => {
        return {
          accepted: response.accepted,
          rejected: response.rejected,
          envelope: response.envelope,
          message: "Email sent successfully",
        };
      })
      .catch((err) => {
        return {
          command: err.command,
          response: err.response,
          validation: { field: "email", message: "Error after sent email" },
        };
      });
  },
};
