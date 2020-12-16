const crypto = require("crypto");
const moment = require("moment");
const { Op } = require("sequelize");
const Users = require("../models/User");
const Events = require("../models/Event");
const { validateDate } = require("../utils");

module.exports = {
  async createEvent(request, response) {
    const {
      owner,
      endDate,
      beginDate,
      status = true,
      notify = false,
      isExpired = false,
      ...othersFields
    } = request.body;

    const { userId: user_id } = request.params;
    const userRegistered = await Users.findByPk(user_id);

    if (!userRegistered)
      return response.json({
        validation: { params: "userId", message: "ID de usuário inválido" },
      });

    if (!validateDate(endDate, beginDate)) {
      return response.json({
        validation: {
          field: "endDate",
          message: "Data maior que data de inicio",
        },
      });
    }

    const hasClockShocls = await Events.findOne({
      where: { owner, beginDate: { [Op.between]: [beginDate, endDate] } },
    });

    if (hasClockShocls) {
      return response.json({
        validation: {
          field: "spreader",
          message:
            `Representante já possui evento cadastrado entre esses` +
            ` horários`,
        },
      });
    }

    const id = crypto.randomBytes(8).toString("hex");

    await Events.create({
      id,
      owner,
      status,
      notify,
      user_id,
      endDate,
      beginDate,
      isExpired,
      photo: request.file ? request.file.filename : "",
      ...othersFields,
    });
  
    const newEvent = await Events.findOne({
      where: { id: id, user_id },
      include: [{ as: "user", model: Users, attributes: ["email"] }],
    });

    return response.json({
      event: newEvent,
      message: "Evento cadastrado com sucesso",
    });
  },

  async updateEvent(request, response) {
    const { userId: user_id, eventId } = request.params;
    const { beginDate, endDate, photoUrl } = request.body;

    const userRegistered = await Users.findByPk(user_id);

    if (!userRegistered)
      return response.json({
        validation: { params: "userId", message: "ID de usuário inválido" },
      });

    const eventRegistered = await Events.findOne({
      where: { id: eventId, user_id },
    });

    if (eventRegistered) {
      const hasClockShocks = await Events.findOne({
        where: {
          id: { [Op.ne]: eventId },
          user_id: { [Op.ne]: user_id },
          beginDate: { [Op.between]: [beginDate, endDate] },
        },
      });

      if (hasClockShocks)
        return response.json({
          validation: {
            field: "spreader",
            message:
              `Representante já possui um evento cadastrado entre esses` +
              ` horários`,
          },
        });

      photoUrl && delete request.body.photo;

      const fieldsToUpdate = Boolean(photoUrl)
        ? request.body
        : {
          ...request.body,
          photo: request.file ? request.file.filename : null,
        };

      await Events.update(fieldsToUpdate, { where: { id: eventId, user_id } });
      
      const updatedEvent = await Events.findOne({
        where: { id: eventId, user_id },
        include: [{ as: "user", model: Users, attributes: ["email"] }],
      });
  
      return response.json({ event: updatedEvent, message: "Evento atualizado com sucesso" });
    }

    return response.json({
      validation: { params: "eventId", message: "ID de evento inválido" },
    });
  },

  async favoriteEvent(request, response) {
    const { favorite } = request.body;
    const { userId, eventId } = request.params;

    const fetchEvent = await Events.findByPk(eventId);

    if (fetchEvent) {
      await Events.update(
        { notify: favorite },
        { where: { id: eventId, user_id: userId } }
      );
      const eventUpdated = await Events.findByPk(eventId);

      return response.json({
        event: eventUpdated,
        message: "Evento favoritado com sucesso",
      });
    }

    return response.json({
      validation: { params: "eventId", message: "ID de evento inválido" },
    });
  },

  async updateStatusEvent(request, response) {
    const { status } = request.body;
    const { eventId, userId: user_id } = request.params;

    const fetchEvent = await Events.findOne({
      where: { id: eventId, user_id },
    });

    if (!fetchEvent) {
      return response.json({
        validation: {
          params: "eventId",
          message: "ID de evento ou usuárioinválido",
        },
      });
    }

    await Events.update({ status }, { where: { id: eventId, user_id } });
    const eventUpdated = await Events.findByPk(eventId, { include: [{ as: "user", model: Users, attributes: ["email"] }]});

    return response.json({
      event: eventUpdated,
      message: "Atualização do estado do evento atualizado",
    });
  },
  
  async fetchEvents(request, response) {
    const { eventId, userId, favorite = false, orderBy = 'ASC', theme } = request.query;

    const events = await Events.findAll({
      where: {
        id: eventId || { [Op.not]: null },
        user_id: userId || { [Op.not] : null },
        notify: favorite || { [Op.not]: null },
        theme: theme ? { [Op.iLike]: `%${theme}%` } : { [Op.not]: null },
      },
      order: [["beginDate", orderBy]],
      include: [{ as: "user", model: Users, attributes: ["email"] }],
    });

    return response.json(events);
  },

  async fetchEventsByUser(request, response) {
    const { userId: user_id, theme = "" } = request.params;

    const fetchUser = await Users.findByPk(user_id);

    if (!fetchUser) {
      return response.json({
        validation: { params: "userId", message: "ID de usuário inválido" },
      });
    }

    const hasFilter = theme !== "null";

    const events = await Events.findAll({
      where: {
        user_id,
        theme: hasFilter ? { [Op.iLike]: `%${theme}%` } : { [Op.not]: null },
      },
    });

    return response.json(events);
  },

  async updateExpiredEventsToDoneStatus(request, response) {
    const { isExpired = true } = request.body;

    await Events.update(
      { isExpired },
      {
        where: {
          status: true,
          endDate: { [Op.lt]: moment().subtract(1, "days") },
        },
      }
    );

    return response.json({ message: "Evento concluído com sucesso" });
  },
};
