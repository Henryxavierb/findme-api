const {Router} = require('express');
const routes = Router();

const {
  signIn,
  signUp,
  updatePassword,
  getUserProfile,
  updateUserProfile,
  getAboutUserEvents,
  updateUserThumbnail,
  sendEmailToResetPassword,
} = require('./controllers/user.js');

const {
  createEvent,
  updateEvent,
  fetchEvents,
  favoriteEvent,
  updateStatusEvent,
  updateEventThumbnail,
} = require('./controllers/event.js');

/*
 * Public routes
 */

routes.post('/session/signIn', signIn);
routes.post('/session/signUp', signUp);
routes.post('/user/password/forgot', sendEmailToResetPassword);

/*
 * Private routes
 */
routes.get('/user/profile', getUserProfile);
routes.put('/user/thumbnail', updateUserThumbnail);
routes.post('/user/password/reset', updatePassword);
routes.get('/user/event/about', getAboutUserEvents);
routes.put('/user/profile/edit', updateUserProfile);

routes.get('/event/list', fetchEvents);
routes.put('/event/edit', updateEvent);
routes.post('/event/create', createEvent);
routes.put('/event/edit/status', updateStatusEvent);
routes.put('/event/edit/favoriteEvent', favoriteEvent);
routes.put('/event/edit/thumbnail', updateEventThumbnail);

module.exports = routes;
