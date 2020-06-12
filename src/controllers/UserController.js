require("dotenv").config();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { sendEmail, generateToken } = require("../utils/index");

const Users = require("../models/User");

module.exports = {
  async singUp(request, response) {
    const { name, email, password } = request.body;

    const emailAlreadyRegistered = await Users.findOne({
      where: { email },
    });

    if (emailAlreadyRegistered) {
      return response.json({
        validation: "Este email já está em uso.",
        field: "email",
      });
    }

    const nameAlreadyRegistered = await Users.findOne({
      where: { name },
    });

    if (nameAlreadyRegistered) {
      return response.json({
        validation: "Este nome já está em uso.",
        field: "name",
      });
    }

    const id = crypto.randomBytes(5).toString("hex");
    const cryptographedPassword = bcrypt.hashSync(password, 10);

    const newUser = await Users.create({
      id,
      name,
      email,
      password: cryptographedPassword,
    });

    const token = generateToken({ id: newUser.id });

    return response.json({
      token,
      user: {
        name,
        email,
        id: newUser.id,
        photo: newUser.photo,
        profile: newUser.profile,
      },
    });
  },

  async singIn(request, response) {
    const { email, password } = request.body;

    const emailRegistered = await Users.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!emailRegistered) {
      return response.json({ validation: "Email inexistente", field: "email" });
    }

    const samePassword = bcrypt.compareSync(password, emailRegistered.password);

    if (!samePassword) {
      return response.json({
        validation: "Senha inválida",
        field: "password",
      });
    }

    // Pass ID in params describre how compare differents tokens
    const token = generateToken({ id: emailRegistered.id });

    return response.json({
      token,
      user: {
        email,
        id: emailRegistered.id,
        name: emailRegistered.name,
        photo: emailRegistered.photo,
        profile: emailRegistered.profile,
      },
    });
  },

  async forgotPassword(request, response) {
    const { email } = request.body;

    const emailRegistered = await Users.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!emailRegistered) {
      return response.json({ validation: "Email inexistente", field: "email" });
    }

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

    return response.json(responseEmail);
  },

  async resetPassword(request, response) {
    const { password, token } = request.body;

    const userRegistered = await Users.findOne({
      where: { expiredToken: token },
    });

    if (userRegistered && userRegistered.timeExpired < new Date())
      return response.json({ validation: "Token expirado" });

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

      return response.json({ message: "Senha atualizada com sucesso" });
    }

    return response.json({ validation: "Expired Token" });
  },

  async listUser(request, response) {
    const findUsers = await Users.findAll({
      attributes: ["id", "profile", "name", "email", "photo"],
    });
    return response.json(findUsers);
  },

  async editUserProfile(request, response) {
    const id = request.user_id;
    const { email, password } = request.body;

    const userRegistered = await Users.findOne({ where: { id } });

    const existentEmail = await Users.findOne({
      where: { email: { [Op.ne]: email } },
    });

    if (existentEmail)
      return response.json({
        Validation: "Email já cadastrado",
        field: "email",
      });

    if (userRegistered) {
      const cryptographedPassword = await bcrypt.hashSync(password, 10);

      await Users.update(
        { ...request.body, cryptographedPassword },
        { where: { id } }
      );

      const updatedUser = await Users.findByPk(id);

      return response.json({
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
    return response.json({ validation: "Usuário inexistente" });
  },

  async addUserPhoto(request, response) {
    const id = request.user_id;
    const { filename } = request.file;

    const userRegistered = await Users.findByPk(id);

    if (userRegistered) {
      await Users.update({ photo: filename }, { where: { id } });
      const updatedPhoto = await Users.findByPk(id);

      return response.json({
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

    return response.json({ validation: "Usuário inexistente" });
  },
};
