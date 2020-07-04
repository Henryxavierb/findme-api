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

    const createEvent = await Events.create({
      id,
      owner,
      status,
      notify,
      user_id,
      endDate,
      beginDate,
      photo: request.file ? request.file.filename : "",
      ...othersFields,
    });

    return response.json({
      event: createEvent,
      message: "Evento cadastrado com sucesso",
    });
  },

  async updateEvent(request, response) {
    const { beginDate, endDate } = request.body;
    const { userId: user_id, eventId } = request.params;

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
          user_id,
          id: { [Op.ne]: eventId },
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

      await Events.update(
        { ...request.body, photo: request.file ? request.file.filename : "" },
        { where: { id: eventId, user_id } }
      );

      const updatedEvent = await Events.findOne({
        where: { id: eventId, user_id },
      });

      return response.json({
        updatedEvent,
        message: "Evento atualizado com sucesso",
      });
    }

    return response.json({
      validation: { params: "eventId", message: "ID de evento inválido" },
    });
  },

  async notifyEvent(request, response) {
    const { notify } = request.body;
    const { eventId } = request.params;

    const fetchEvent = await Events.findByPk(eventId);

    if (fetchEvent) {
      await Events.update({ notify }, { where: { id: eventId } });
      const eventUpdated = await Events.findByPk(eventId);

      return response.json({
        event: eventUpdated,
        message: "Notificação de evento atualizada",
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
    const eventUpdated = await Events.findByPk(eventId);

    return response.json({
      event: eventUpdated,
      message: "Atualização do estado do evento atualizado",
    });
  },

  // ///////////////////////////////////////////////////////////////////////
  //
  // Filters can be applyed:
  //
  // {
  //   "today": true
  //   "eventId": null
  //   "theme": "some text...",
  //   "orderBy": "DESC" or "ASC",
  // }
  //
  // //////////////////////////////////////////////////////////////////////
  async fetchEvents(request, response) {
    const {
      eventId,
      theme = "",
      orderBy = "ASC",
      isToday = false,
    } = request.params;

    const beginDate = moment({ hour: 0, minute: 1, second: 0 });
    const endDate = moment({ hour: 23, minute: 59, second: 0 });

    const hasFilter = theme !== "null";
    const filterEvent = eventId !== "null";
    const hasEventToday = isToday !== "false";

    const events = await Events.findAll({
      where: {
        beginDate: hasEventToday
          ? { [Op.between]: [beginDate, endDate] }
          : { [Op.not]: null },
        id: filterEvent ? eventId : { [Op.not]: null },
        notify: hasEventToday ? true : { [Op.not]: null },
        theme: hasFilter ? { [Op.iLike]: `%${theme}%` } : { [Op.not]: null },
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

    const events = await Events.findAll({
      where: { user_id, theme: { [Op.iLike]: `%${theme}%` } },
    });

    return response.json(events);
  },

  async removeEventsBeforeToday(request, response) {
    await Events.destroy({
      where: { beginDate: { [Op.lt]: moment().subtract("days", 1) } },
    });

    return response.json({ message: "Evento(s) excluido com sucesso" });
  },
};
