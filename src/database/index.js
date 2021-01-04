require("dotenv").config();
const Sequelize = require("sequelize");
const config = require("../config/database");

const User = require("../models/User");
const Event = require("../models/Event");

const connection = new Sequelize(`${process.env.DATABASE_URL}`);

// /////////////////////////////////////////////////////////////////////////
//  Models
// /////////////////////////////////////////////////////////////////////////
User.init(connection);
Event.init(connection);

// /////////////////////////////////////////////////////////////////////////
//  Associations
// /////////////////////////////////////////////////////////////////////////
User.associate(connection.models);
Event.associate(connection.models);

module.exports = connection;
