const { Op } = require("sequelize");
const Users = require("../models/User");
const Events = require("../models/Event");

const moment = require("moment");
const { validateDate } = require("../utils");

module.exports = {
  async createEvent(request, response) {
    const {
      owner,
      endDate,
      beginDate,
      notify = false,
      status = "CONFIRMADO",
      ...othersFields
    } = request.body;

    const { userId: user_id } = request.params;
    const userRegistered = await Users.findByPk(user_id);

    if (!userRegistered)
      return response.json({ validation: "User dont exist" });

    if (!validateDate(endDate, beginDate)) {
      return response.json({ validation: "Invalid date" });
    }

    const hasClockShocls = await Events.findOne({
      where: { owner, beginDate: { [Op.between]: [beginDate, endDate] } },
    });

    if (hasClockShocls) {
      return response.json({
        validation: "This owner has event between begin date and end date",
      });
    }

    const createEvent = await Events.create({
      owner,
      status,
      notify,
      endDate,
      user_id,
      beginDate,
      ...othersFields,
    });

    return response.json({
      event: createEvent,
      message: "Event registred Successfully",
    });
  },

  async updateEvent(request, response) {
    const { id } = request.params;
    const { userId: user_id } = request.params;
    const { owner, beginDate, endDate } = request.body;

    const userRegistered = await Users.findByPk(user_id);

    if (!userRegistered)
      return response.json({ validation: "User dont exist" });

    const eventRegistered = await Events.findOne({ where: { id, user_id } });

    if (eventRegistered) {
      const hasClockShocks = await Events.findOne({
        where: {
          user_id,
          id: { [Op.ne]: id },
          beginDate: { [Op.between]: [beginDate, endDate] },
        },
      });

      if (hasClockShocks)
        return response.json({
          validation: "This owner has event between begin date and end date",
        });

      await Events.update(request.body, { where: { id, user_id } });
      const updatedEvent = await Events.findOne({ where: { id, user_id } });

      return response.json({
        updatedEvent,
        message: "Event updated successfully",
      });
    }

    return response.json({ validation: "Non-existent event" });
  },

  // ///////////////////////////////////////////////////////////////////////
  //
  // Filters can be applyed:
  // { "theme": "some text...", "orderBy": "DESC", "today": true }
  //
  // //////////////////////////////////////////////////////////////////////
  async listAllEvents(request, response) {
    const { id, today = false, theme = "", orderBy = "ASC" } = request.body;

    const bd = moment({ hour: 0, minute: 1, second: 0 });
    const ed = moment({ hour: 23, minute: 59, second: 0 });

    const events = await Events.findAll({
      where: {
        id: id ? id : { [Op.gte]: 1 },
        theme: { [Op.iLike]: `%${theme}%` },
        beginDate: today ? { [Op.between]: [bd, ed] } : { [Op.not]: null },
      },
      order: [["beginDate", orderBy]],
    });

    return response.json(events);
  },

  async listEventsByUser(request, response) {
    const { userId: user_id } = request.params;
    const { id, today, theme = "", orderBy = "ASC" } = request.body;

    const beginToday = moment({ hour: 0, minute: 1, second: 0 });
    const endToday = moment({ hour: 23, minute: 59, second: 0 });

    const events = await Events.findAll({
      where: {
        user_id,
        id: id ? id : { [Op.gte]: 1 },
        theme: { [Op.iLike]: `%${theme}%` },
        beginDate: today
          ? { [Op.between]: [beginToday, endToday] }
          : { [Op.not]: null },
      },
      order: [["beginDate", orderBy]],
    });

    return response.json(events);
  },

  async deleteEventByUser(request, response) {
    const { id } = request.params;
    const { userId: user_id } = request.params;

    const eventRegistered = await Events.findByPk(id);
    const userRegistered = await Users.findByPk(user_id);

    if (!userRegistered) {
      return response.json({ validation: "Non-existent user" });
    }

    if (!eventRegistered) {
      return response.json({ validation: "Non-existent event" });
    }

    await Events.destroy({ where: { user_id, id } });
    return response.json({ message: "Event deleted successfully" });
  },

  async autoDestroyEventBeforeToday(request, response) {
    await Events.destroy({
      where: { beginDate: { [Op.lt]: moment().subtract("days", 1) } },
    });

    return response.json({ message: "Events deleteds" });
  },
};
