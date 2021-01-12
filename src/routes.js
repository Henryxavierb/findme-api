const {Router} = require('express');
const routes = Router();

// /////////////////////////////////////////////////////////////////////////
//
// Controllers
//
// /////////////////////////////////////////////////////////////////////////

const {
  signIn,
  signUp,
  fetchUsers,
  updatePhoto,
  syncUserData,
  updateProfile,
  resetPassword,
  fetchProfileData,
  sendEmailToResetPassword,
} = require('./controllers/UserController');

const {
  createEvent,
  updateEvent,
  fetchEvents,
  favoriteEvent,
  updateStatusEvent,
  fetchEventsByUser,
  updateExpiredEventsToDoneStatus,
} = require('./controllers/EventController');

// /////////////////////////////////////////////////////////////////////////
//
// User routes
//
// /////////////////////////////////////////////////////////////////////////
routes.post('/signIn', signIn);
routes.post('/signUp', signUp);
routes.get('/user/list', fetchUsers);
routes.post('/user/password/new', resetPassword);
routes.post('/user/password/forgot', sendEmailToResetPassword);

// routes.use(tokkenAuthorization);
routes.get('/user/:userId/detail', syncUserData);
routes.put('/user/:userId/profile', updateProfile);
routes.put('/user/:userId/photo', updatePhoto);
routes.get('/user/:spreaderEmail/profile', fetchProfileData);

// /////////////////////////////////////////////////////////////////////////
//
// Event routes
//
// /////////////////////////////////////////////////////////////////////////
routes.get('/event/list', fetchEvents);
routes.get('/event/:userId/list/:theme', fetchEventsByUser);
routes.put('/event/:userId/favorite/:eventId', favoriteEvent);
routes.put('/event/:userId/status/:eventId', updateStatusEvent);

routes.put('/event/done', updateExpiredEventsToDoneStatus);
routes.post('/event/:userId/create', createEvent);
routes.put('/event/:userId/edit/:eventId', updateEvent);

module.exports = routes;
