const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const path = require("path");
require("./database");

const app = express();
app.use(cors());


app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    "default-src 'self'; font-src 'self'; img-src 'self' https://images.unsplash.com; script-src 'self'; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css; frame-src 'self'"
  );
  next();
});

app.use(express.json());

app.use("/files", express.static(path.resolve(__dirname, "..", "uploads")));
app.use(routes);

module.exports = app;
