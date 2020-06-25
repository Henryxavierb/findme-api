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
        validation: {
          field: "email",
          message: "Este email já está em uso.",
        },
      });
    }

    const nameAlreadyRegistered = await Users.findOne({
      where: { name },
    });

    if (nameAlreadyRegistered) {
      return response.json({
        validation: {
          field: "name",
          message: "Este nome já está em uso.",
        },
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

    const sendThumbnail = newUser.photo ? newUser.photoUrl : null;

    return response.json({
      token,
      user: {
        name,
        email,
        id: newUser.id,
        photo: sendThumbnail,
      },
    });
  },

  async singIn(request, response) {
    const { email, password } = request.body;

    const emailRegistered = await Users.findOne({
      where: { email },
    });

    if (!emailRegistered) {
      return response.json({
        validation: {
          field: "email",
          message: "Email inexistente",
        },
      });
    }

    const samePassword = bcrypt.compareSync(password, emailRegistered.password);

    if (!samePassword) {
      return response.json({
        validation: {
          field: "password",
          message: "Senha inválida",
        },
      });
    }

    // Pass ID in params describre how compare differents tokens
    const token = generateToken({ id: emailRegistered.id });

    const sendThumbnail = emailRegistered.photo
      ? emailRegistered.photoUrl
      : null;

    return response.json({
      token,
      user: {
        email,
        photo: sendThumbnail,
        id: emailRegistered.id,
        name: emailRegistered.name,
      },
    });
  },

  async forgotPassword(request, response) {
    const { email } = request.body;

    const emailRegistered = await Users.findOne({
      where: { email },
    });

    if (!emailRegistered) {
      return response.json({
        validation: {
          field: "email",
          message: "Email inexistente",
        },
      });
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
      return response.json({
        validation: {
          field: "token",
          message: "Token expirado",
        },
      });

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

    return response.json({
      validation: {
        field: "token",
        message: "Token expirado",
      },
    });
  },

  async listUser(request, response) {
    const findUsers = await Users.findAll({
      attributes: ["id", "name", "email", "photo", "photoUrl"],
    });

    return response.json(findUsers);
  },

  async editUserProfile(request, response) {
    const { userId: id } = request.params;
    const { name, email, password } = request.body;

    const userRegistered = await Users.findOne({ where: { id } });

    if (email) {
      const existentEmail = await Users.findOne({
        where: { email, id: { [Op.ne]: id } },
      });

      if (existentEmail)
        return response.json({
          validation: {
            field: "email",
            message: "Email já cadastrado",
          },
        });
    }

    if (name) {
      const nameAlreadyRegistered = await Users.findOne({
        where: { name, id: { [Op.ne]: id } },
      });

      if (nameAlreadyRegistered) {
        return response.json({
          validation: {
            field: "name",
            message: "Este nome já está em uso.",
          },
        });
      }
    }

    if (userRegistered) {
      const cryptographedPassword = await bcrypt.hashSync(password, 10);

      await Users.update(
        password
          ? { ...request.body, password: cryptographedPassword }
          : { ...request.body },
        { where: { id } }
      );

      const updatedUser = await Users.findByPk(id);

      return response.json({
        user: {
          id,
          name: updatedUser.name,
          email: updatedUser.email,
          photo: updatedUser.photoUrl,
        },
      });
    }
    return response.json({ validation: "Usuário inexistente" });
  },

  async addUserPhoto(request, response) {
    const { userId: id } = request.params;

    const userRegistered = await Users.findByPk(id);

    if (userRegistered) {
      await Users.update(
        { photo: (request.file && request.file.filename) || null },
        { where: { id } }
      );

      const updatedPhoto = await Users.findByPk(id);

      return response.json({
        user: {
          id,
          name: updatedPhoto.name,
          email: updatedPhoto.email,
          photo: updatedPhoto.photoUrl,
        },
        message: "Photo updated successfully",
      });
    }

    return response.json({ validation: "Usuário inexistente" });
  },
};
