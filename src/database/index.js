const Sequelize = require('sequelize');
const databaseConfig = require('./config');
const UserModel = require('../models/User');
const EventModel = require('../models/Event');

const connection = new Sequelize(databaseConfig);

UserModel.init(connection);
EventModel.init(connection);

UserModel.associate(connection.models);
EventModel.associate(connection.models);

module.exports = connection;
