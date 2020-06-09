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
        type: Sequelize.STRING,
      },
      notify: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      theme: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      owner: {
        allowNull: false,
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
      },
      description: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      image: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      youtube: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      twitter: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      linkedin: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      instagram: {
        allowNull: true,
        type: Sequelize.STRING,
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
