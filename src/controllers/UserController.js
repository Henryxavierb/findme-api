require("dotenv").config();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { sendEmail, generateToken } = require("../utils/index");

const Users = require("../models/User");

module.exports = {
  async singUp(request, response) {
    const { name, email, password } = request.body;

    const alreadyRegistered = await Users.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!alreadyRegistered) {
      const id = crypto.randomBytes(5).toString("hex");
      const cryptographedPassword = bcrypt.hashSync(password, 10);

      const newUser = await Users.create({
        id,
        name,
        email: email.toLowerCase(),
        password: cryptographedPassword,
      });

      const token = generateToken({ id: newUser.id });

      return response.json({
        token,
        message: "User successfully registred",
        user: {
          name,
          email,
          id: newUser.id,
          photo: newUser.photo,
          profile: newUser.profile,
        },
      });
    }

    return response.json({
      validation: "User already registered",
      field: ["email"],
    });
  },

  async singIn(request, response) {
    const { email, password } = request.body;

    const emailRegistered = await Users.findOne({
      where: { email: email.toLowerCase() },
    });

    if (emailRegistered) {
      const samePassword = bcrypt.compareSync(
        password,
        emailRegistered.password
      );

      if (samePassword) {
        // Pass ID in params describre how compare differents tokens
        const token = generateToken({ id: emailRegistered.id });

        return response.status(200).json({
          token,
          message: "User successfullyn logged in",
          user: {
            email,
            id: emailRegistered.id,
            name: emailRegistered.name,
            photo: emailRegistered.photo,
            profile: emailRegistered.profile,
          },
        });
      }

      return response.status(422).json({
        validation: "Invalid credentials",
        field: ["email", "password"],
      });
    }

    return response.json({ validation: "Non-existent user", field: ["email"] });
  },

  async forgotPassword(request, response) {
    const { email } = request.body;

    const emailRegistered = await Users.findOne({
      where: { email: email.toLowerCase() },
    });

    if (emailRegistered) {
      const timeExpired = new Date();
      timeExpired.setHours(timeExpired.getHours() + 1);

      const userToken = crypto.randomBytes(20).toString("hex");

      const responseEmail = await sendEmail(
        userToken,
        request.body,
        emailRegistered.name
      );
      await Users.update(
        { expiredToken: userToken, timeExpired },
        { where: { email } }
      );
      return response.status(200).json(responseEmail);
    }
    return response
      .status(404)
      .json({ validation: "Non-existent user", field: ["email"] });
  },

  async resetPassword(request, response) {
    const { password, token } = request.body;

    const userRegistered = await Users.findOne({
      where: { expiredToken: token },
    });

    if (userRegistered && userRegistered.timeExpired < new Date())
      return response.json({ validation: "Expired Token" });

    if (userRegistered) {
      const cryptographedPassword = await bcrypt.hashSync(password, 10);
      await Users.update(
        {
          timeExpired: null,
          expiredToken: null,
          password: cryptographedPassword,
        },
        { where: { expiredToken: token } }
      );

      return response
        .status(200)
        .json({ message: "Password updated successfully" });
    }

    return response.json({ validation: "Expired Token" });
  },

  async listUser(request, response) {
    const findUsers = await Users.findAll({
      attributes: ["id", "profile", "name", "email", "photo"],
    });
    return response.status(200).json(findUsers);
  },

  async editUserProfile(request, response) {
    const id = request.user_id;
    const { email } = request.body;

    const userRegistered = await Users.findOne({ where: { id } });

    if (email) {
      const existentEmail = await Users.findOne({
        where: { email },
      });

      if (existentEmail)
        return response
          .status(422)
          .json({ Validation: "Non-existent email", field: ["email"] });
    }

    if (userRegistered) {
      await Users.update(request.body, { where: { id } });
      const updatedUser = await Users.findByPk(id);

      return response.status(200).json({
        user: {
          id,
          name: updatedUser.name,
          email: updatedUser.email,
          photo: updatedUser.photo,
          profile: updatedUser.profile,
        },
        message: "Profile updated successfully",
      });
    }
    return response.json({ validation: "Non-existent user" });
  },

  async addUserPhoto(request, response) {
    const id = request.user_id;
    const { filename } = request.file;

    const userRegistered = await Users.findByPk(id);

    if (userRegistered) {
      await Users.update({ photo: filename }, { where: { id } });
      const updatedPhoto = await Users.findByPk(id);

      return response.status(200).json({
        user: {
          id,
          name: updatedPhoto.name,
          email: updatedPhoto.email,
          photo: updatedPhoto.photo,
          profile: updatedPhoto.profile,
        },
        message: "Photo updated successfully",
      });
    }

    return response.json({ validation: "Non-existent user" });
  },
};
