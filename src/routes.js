const multer = require("multer");
const { Router } = require("express");
const uploadConfig = require("./config/upload");
const { tokkenAuthorization } = require("./utils/index");

const routes = Router();
const upload = multer(uploadConfig);
const settingImage = upload.single("photo");

// /////////////////////////////////////////////////////////////////////////
//
// Controllers & Middlewares
//
// /////////////////////////////////////////////////////////////////////////

const {
  singIn,
  singUp,
  listUser,
  addUserPhoto,
  resetPassword,
  editUserProfile,
  forgotPassword,
  fetchSpreaderProfile,
} = require("./controllers/UserController");

const {
  createEvent,
  updateEvent,
  notifyEvent,
  listAllEvents,
  listEventsByUser,
  deleteEventByUser,
  autoDestroyEventBeforeToday,
} = require("./controllers/EventController");

// /////////////////////////////////////////////////////////////////////////
//
// User routes
//
// /////////////////////////////////////////////////////////////////////////
routes.post("/login", singIn);
routes.get("/user/list", listUser);
routes.post("/user/create", singUp);
routes.post("/user/password/new", resetPassword);
routes.post("/user/password/forgot", forgotPassword);

routes.use(tokkenAuthorization);
routes.put("/user/:userId/profile", editUserProfile);
routes.put("/user/:userId/photo", settingImage, addUserPhoto);
routes.get("/user/:spreaderEmail/profile", fetchSpreaderProfile);

// /////////////////////////////////////////////////////////////////////////
//
// Event routes
//
// /////////////////////////////////////////////////////////////////////////
routes.put("/event/:id/notify", notifyEvent);
// routes.get("/event/:userId/list", listEventsByUser);
routes.delete("/event/:userId/delete/:id", deleteEventByUser);
routes.post("/event/:userId/create", settingImage, createEvent);
routes.put("/event/:userId/edit/:id", settingImage, updateEvent);
routes.get("/event/list/:orderBy/:theme/:isToday", listAllEvents);
routes.delete("/event/:userId/delete/:id", autoDestroyEventBeforeToday);

module.exports = routes;
