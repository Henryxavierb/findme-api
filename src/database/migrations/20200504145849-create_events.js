"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("events", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      user_id: {
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        type: Sequelize.STRING,
        references: { model: "users", key: "id" },
      },
      status: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      is_expired: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      notify: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      theme: {
        allowNull: false,
        type: Sequelize.STRING(1000),
      },
      owner: {
        allowNull: false,
        type: Sequelize.STRING(1000),
      },
      begin_date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      end_date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      link: {
        allowNull: false,
        type: Sequelize.STRING(1000),
      },
      description: {
        allowNull: true,
        type: Sequelize.STRING(2000),
      },
      photo: {
        allowNull: true,
        type: Sequelize.STRING(1000),
      },
      youtube: {
        allowNull: true,
        type: Sequelize.STRING(1000),
      },
      twitter: {
        allowNull: true,
        type: Sequelize.STRING(1000),
      },
      linkedin: {
        allowNull: true,
        type: Sequelize.STRING(1000),
      },
      instagram: {
        allowNull: true,
        type: Sequelize.STRING(1000),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("events");
  },
};
