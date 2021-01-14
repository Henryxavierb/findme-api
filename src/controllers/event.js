const {Op} = require('sequelize');
const Users = require('../models/User');
const Events = require('../models/Event');
const ProvideException = require('../utils/provider.exception.js');
const {validateMissingFields, generateHash} = require('../services/user.js');

const {
  validateDates,
  validateLinks,
  validateOrderByField,
  updateToDoneExpiredEventList,
} = require('../services/event.js');

module.exports = {
  /*
   * @body link: 'https://example.com/watch...'
   * @body theme: 'example theme'
   * @body description: 'example description'
   * @body representative_user: 'example owner'
   * @body thumbnail: 'data:image/png;base64,#3@#131adad1...'
   * @body end_date: '2021-12-30T09:30:56.000Z'
   * @body start_date: '2021-01-30T09:30:56.000Z'
   * @body is_available: true
   * @body is_favorite_event: false
   * @body is_expired: false
   * @body youtube: '',
   * @body twitter: '',
   * @body linked_in: 'https://linkedin.com/in/example...'
   * @body instagram: https://instagram.com/example...'
   *
   * @query user_id: '#31231ehjha71...'
   */
  async createEvent(request, response) {
    const {
      link,
      twitter,
      youtube,
      linked_in,
      instagram,
      end_date,
      start_date,
      thumbnail = '',
      is_expired = false,
      is_available = true,
      is_favorite_event = false,
      ...othersFields
    } = request.body;

    try {
      const links = {link, youtube, twitter, instagram, linked_in};

      const {user_id} = request.query;
      const isAnValidUser = await Users.findByPk(user_id);

      if (!isAnValidUser)
        throw new ProvideException('user_id', 'user_id inválido');

      validateLinks(links);
      validateDates(start_date, end_date);

      const event_id = generateHash(8);

      await Events.create({
        user_id,
        ...links,
        end_date,
        thumbnail,
        start_date,
        is_expired,
        id: event_id,
        is_available,
        is_favorite_event,
        ...othersFields,
      });

      const event = await Events.findOne({
        where: {id: event_id, user_id},
        include: [{as: 'user', model: Users, attributes: ['email']}],
      });

      return response.json(event);
    } catch ({field, message}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * @query user_id: 'Ki1j8123...'
   * @query event_id: '!#i1j8123...'
   * @body thumbnail: 'data:image/png;base64,!@#sae1231j...'
   */
  async updateEventThumbnail(request, response) {
    const {thumbnail = ''} = request.body;
    const {user_id, event_id} = request.query;

    try {
      validateMissingFields({user_id, event_id});
      const isAnValidUser = await Events.findOne({where: {user_id}});

      if (!isAnValidUser)
        throw new ProvideException('user_id', 'user_id inválido');

      const isARegisteredEvent = await Events.findOne({
        where: {id: event_id, user_id},
      });

      if (!isARegisteredEvent)
        throw new ProvideException('event_id', 'event_id inválido');

      await Events.update({thumbnail}, {where: {id: event_id, user_id}});

      const event = await Events.findOne({
        where: {id: event_id, user_id},
        include: [{as: 'user', model: Users, attributes: ['email']}],
      });

      return response.json(event);
    } catch ({field, message}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * All @body fields used in the create event function, but dont receive thumbnail
   *
   * @query user_id: '#31231ehjha71...'
   * @query event_id: '!8921ehjha71...'
   */
  async updateEvent(request, response) {
    const {
      link,
      twitter,
      youtube,
      linked_in,
      instagram,
      end_date,
      start_date,
      is_expired = false,
      is_available = true,
      is_favorite_event = false,
      ...othersFields
    } = request.body;

    try {
      const links = {link, youtube, twitter, instagram, linked_in};

      const {user_id, event_id} = request.query;
      const isRegisteredUser = await Users.findByPk(user_id);

      if (!isRegisteredUser)
        throw new ProvideException('user_id', 'user_id inválido');

      const isRegisteredEvent = await Events.findByPk(event_id);

      if (!isRegisteredEvent)
        throw new ProvideException('event_id', 'event_id inválido');

      validateLinks(links);
      validateDates(start_date, end_date);

      await Events.update({
        user_id,
        ...links,
        end_date,
        start_date,
        is_expired,
        id: event_id,
        is_available,
        is_favorite_event,
        ...othersFields,
      }, {where: {id: event_id, user_id}});

      const event = await Events.findOne({
        where: {id: event_id, user_id},
        include: [{as: 'user', model: Users, attributes: ['email']}],
      });

      return response.json(event);
    } catch ({field, message}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * @body is_favorite_event: true
   * @query user_id: '#31231ehjha71...'
   * @query event_id: '!8921ehjha71...'
   */
  async favoriteEvent(request, response) {
    const {user_id, event_id} = request.query;
    const {is_favorite_event = false} = request.body;

    try {
      validateMissingFields({user_id, event_id, is_favorite_event});
      const isAnValidUser = await Events.findOne({where: {user_id}});

      if (!isAnValidUser)
        throw new ProvideException('user_id', 'user_id inválido');

      const isARegisteredEvent = await Events.findOne({
        where: {id: event_id, user_id},
      });

      if (!isARegisteredEvent)
        throw new ProvideException('event_id', 'event_id inválido');

      await Events.update({is_favorite_event}, {where: {id: event_id, user_id}});

      const event = await Events.findOne({
        where: {id: event_id, user_id},
        include: [{as: 'user', model: Users, attributes: ['email']}],
      });

      return response.json(event);

    } catch ({field, message}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * @body is_available: false
   * @query user_id: '#31231ehjha71...'
   * @query event_id: '!8921ehjha71...'
   */
  async updateStatusEvent(request, response) {
    const {user_id, event_id} = request.query;
    const {is_available = false} = request.body;

    try {
      validateMissingFields({user_id, event_id, is_available});
      const isAnValidUser = await Events.findOne({where: {user_id}});

      if (!isAnValidUser)
        throw new ProvideException('user_id', 'user_id inválido');

      const isARegisteredEvent = await Events.findOne({
        where: {id: event_id, user_id},
      });

      if (!isARegisteredEvent)
        throw new ProvideException('event_id', 'event_id inválido');

      await Events.update({is_available}, {where: {id: event_id, user_id}});

      const event = await Events.findOne({
        where: {id: event_id, user_id},
        include: [{as: 'user', model: Users, attributes: ['email']}],
      });

      return response.json(event);

    } catch ({field, message}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * @query theme: 'example theme'
   * @query user_id: '#31231ehjha71...'
   * @query event_id: '!8921ehjha71...'
   * @query is_favorite_event: true
   * @query order_by: 'ASC' | 'DESC'
   */
  async fetchEvents(request, response) {
    const {event_id, user_id, is_favorite_event = false, order_by = 'ASC', theme} = request.query;

    try {
      validateOrderByField(order_by);
      await updateToDoneExpiredEventList();

      const events = await Events.findAll({
        where: {
          id: event_id || {[Op.not]: null},
          user_id: user_id || {[Op.not]: null},
          is_favorite_event: is_favorite_event || {[Op.not]: null},
          theme: theme ? {[Op.iLike]: `%${theme}%`} : {[Op.not]: null},
        },
        order: [['start_date', order_by], ['is_expired', 'DESC']],
        include: [{as: 'user', model: Users, attributes: ['email']}],
      });

      return response.json(events);
    } catch ({field, message}) {
      return response.json({status: 'error', field, message});
    }
  },
};
