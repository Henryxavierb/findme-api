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
routes.post("/user/create", singUp);
routes.post("/user/password/new", resetPassword);
routes.post("/user/password/forgot", forgotPassword);

routes.use(tokkenAuthorization);
routes.get("/user/list", listUser);
routes.put("/user/profile", editUserProfile);
routes.put("/user/photo", settingImage, addUserPhoto);

// /////////////////////////////////////////////////////////////////////////
//
// Event routes
//
// /////////////////////////////////////////////////////////////////////////
routes.get("/event/list", listAllEvents);
routes.get("/event/list/user", listEventsByUser);
routes.delete("/event/:id/delete", deleteEventByUser);
routes.post("/event/create", settingImage, createEvent);
routes.put("/event/:id/edit", settingImage, updateEvent);
routes.delete("/event/delete", autoDestroyEventBeforeToday);

module.exports = routes;
