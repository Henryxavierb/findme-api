const multer = require("multer");
const { Router } = require("express");
const uploadConfig = require("./config/upload");
const { tokkenAuthorization } = require("./utils/index");

const routes = Router();
const upload = multer(uploadConfig);
const settingImage = upload.single("photo");

// /////////////////////////////////////////////////////////////////////////
//
// Controllers
//
// /////////////////////////////////////////////////////////////////////////

const {
  singIn,
  singUp,
  fetchUsers,
  updatePhoto,
  updateProfile,
  resetPassword,
  fetchProfileData,
  sendEmailToResetPassword,
} = require("./controllers/UserController");

const {
  createEvent,
  updateEvent,
  fetchEvents,
  favoriteEvent,
  updateStatusEvent,
  fetchEventsByUser,
  updateExpiredEventsToDoneStatus,
} = require("./controllers/EventController");

// /////////////////////////////////////////////////////////////////////////
//
// User routes
//
// /////////////////////////////////////////////////////////////////////////
routes.post("/singIn", singIn);
routes.post("/singUp", singUp);
routes.get("/user/list", fetchUsers);
routes.post("/user/password/new", resetPassword);
routes.post("/user/password/forgot", sendEmailToResetPassword);

routes.use(tokkenAuthorization);
routes.put("/user/:userId/profile", updateProfile);
routes.put("/user/:userId/photo", settingImage, updatePhoto);
routes.get("/user/:spreaderEmail/profile", fetchProfileData);

// /////////////////////////////////////////////////////////////////////////
//
// Event routes
//
// /////////////////////////////////////////////////////////////////////////
routes.get("/event/:userId/list/:theme", fetchEventsByUser);
routes.put("/event/:userId/favorite/:eventId", favoriteEvent);
routes.put("/event/:userId/status/:eventId", updateStatusEvent);
routes.get("/event/list/:orderBy/:theme/:favorited/:eventId", fetchEvents);

routes.put("/event/done", updateExpiredEventsToDoneStatus);
routes.post("/event/:userId/create", settingImage, createEvent);
routes.put("/event/:userId/edit/:eventId", settingImage, updateEvent);

module.exports = routes;
