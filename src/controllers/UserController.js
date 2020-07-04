require("dotenv").config();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Op } = require("sequelize");
const Users = require("../models/User");
const Events = require("../models/Event");
const { sendEmail, generateToken } = require("../utils/index");

module.exports = {
  async singUp(request, response) {
    const { name, email, password } = request.body;

    const emailAlreadyRegistered = await Users.findOne({
      where: { email },
    });

    if (emailAlreadyRegistered) {
      return response.json({
        validation: { field: "email", message: "Este email já está em uso." },
      });
    }

    const nameAlreadyRegistered = await Users.findOne({
      where: { name },
    });

    if (nameAlreadyRegistered) {
      return response.json({
        validation: { field: "name", message: "Este nome já está em uso." },
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

    return response.json({ token, user: { name, email, id: newUser.id } });
  },

  async singIn(request, response) {
    const { email, password } = request.body;

    const emailRegistered = await Users.findOne({
      where: { email },
    });

    if (!emailRegistered) {
      return response.json({
        validation: { field: "email", message: "Email inexistente" },
      });
    }

    const samePassword = bcrypt.compareSync(password, emailRegistered.password);

    if (!samePassword) {
      return response.json({
        validation: { field: "password", message: "Senha inválida" },
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
        photo: emailRegistered.photoUrl,
      },
    });
  },

  async sendEmailToResetPassword(request, response) {
    const { email } = request.body;

    const emailRegistered = await Users.findOne({
      where: { email },
    });

    if (!emailRegistered) {
      return response.json({
        validation: { field: "email", message: "Email inexistente" },
      });
    }

    const timeExpired = new Date();
    timeExpired.setHours(timeExpired.getHours() + 1);

    const userToken = crypto.randomBytes(20).toString("hex");

    const responseEmail = await sendEmail(
      userToken,
      email,
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
        validation: { field: "token", message: "Token expirado" },
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
      validation: { field: "token", message: "Token expirado" },
    });
  },

  async fetchUsers(request, response) {
    const findUsers = await Users.findAll({
      attributes: ["id", "name", "email", "photo", "photoUrl"],
    });

    return response.json(findUsers);
  },

  async fetchProfileData(request, response) {
    const { spreaderEmail: email } = request.params;

    const fetchUserProfile = await Users.findOne({
      where: { email },
      attributes: ["id", "name", "email", "photo", "photoUrl"],
    });

    const totalEventDiscloseds = await Events.count({
      where: { user_id: fetchUserProfile.id },
    });

    const totalEventCanceled = await Events.count({
      where: { user_id: fetchUserProfile.id, status: false },
    });

    if (!fetchUserProfile) {
      return response.json({
        validation: {
          field: "email",
          message: "Email inexistente",
        },
      });
    }

    return response.json({
      user: fetchUserProfile,
      eventsCanceled: totalEventCanceled,
      eventsDiscloseds: totalEventDiscloseds,
    });
  },

  async updateProfile(request, response) {
    const { userId: id } = request.params;
    const { name, email, password } = request.body;

    const existentEmail = await Users.findOne({
      where: { email, id: { [Op.ne]: id } },
    });

    if (existentEmail)
      return response.json({
        validation: { field: "email", message: "Email já cadastrado" },
      });

    const nameAlreadyRegistered = await Users.findOne({
      where: { name, id: { [Op.ne]: id } },
    });

    if (nameAlreadyRegistered) {
      return response.json({
        validation: { field: "name", message: "Este nome já está em uso." },
      });
    }

    const userRegistered = await Users.findOne({ where: { id } });

    if (userRegistered) {
      const cryptographedPassword = await bcrypt.hashSync(password, 10);

      await Users.update(
        { ...request.body, password: cryptographedPassword },
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

    return response.json({ validation: "ID de usuário inexistente" });
  },

  async updatePhoto(request, response) {
    const { userId: id } = request.params;

    const userRegistered = await Users.findByPk(id);

    if (!userRegistered) {
      return response.json({ validation: "ID de usuário inexistente" });
    }

    const thumbnail = request.file && request.file.filename;
    await Users.update({ photo: thumbnail || null }, { where: { id } });

    const updatedPhoto = await Users.findByPk(id);

    return response.json({
      user: {
        id,
        name: updatedPhoto.name,
        email: updatedPhoto.email,
        photo: updatedPhoto.photoUrl,
      },
      message: "Foto de perfil atualizada com sucesso",
    });
  },
};
