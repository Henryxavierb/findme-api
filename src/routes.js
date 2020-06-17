const multer = require("multer");
const { Router } = require("express");
const uploadConfig = require("./config/upload");
const { tokkenAuthorization } = require("./utils/index");

const routes = Router();
const upload = multer(uploadConfig);
const settingImage = upload.single("thumbnail");

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
} = require("./controllers/UserController");

const {
  createEvent,
  updateEvent,
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

// /////////////////////////////////////////////////////////////////////////
//
// Event routes
//
// /////////////////////////////////////////////////////////////////////////
routes.get("/event/list", listAllEvents);
routes.get("/event/:userId/list", listEventsByUser);
routes.delete("/event/:userId/delete/:id", deleteEventByUser);
routes.post("/event/:userId/create", settingImage, createEvent);
routes.put("/event/:userId/edit/:id", settingImage, updateEvent);
routes.delete("/event/:userId/delete/:id", autoDestroyEventBeforeToday);

module.exports = routes;
