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
  updateEventPhoto,
  updateStatusEvent,
  fetchEventsByUser,
  updateExpiredEventsToDoneStatus,
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

/*
 * Missing refactor
 */

routes.get('/event/list', fetchEvents);
routes.get('/event/:userId/list/:theme', fetchEventsByUser);
routes.put('/event/:userId/favorite/:eventId', favoriteEvent);
routes.put('/event/:userId/status/:eventId', updateStatusEvent);

routes.post('/event/:userId/create', createEvent);
routes.put('/event/:userId/edit/:eventId', updateEvent);
routes.put('/event/done', updateExpiredEventsToDoneStatus);
routes.put('/event/:userId/edit/:eventId/photo', updateEventPhoto);

module.exports = routes;
