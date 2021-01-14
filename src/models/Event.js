require("dotenv").config();
const { DataTypes, Model } = require("sequelize");

class Event extends Model {
  static init(connection) {
    super.init(
      {
        link: DataTypes.STRING,
        theme: DataTypes.STRING,
        end_date: DataTypes.DATE,
        start_date: DataTypes.DATE,
        youtube: DataTypes.STRING,
        twitter: DataTypes.STRING,
        linked_in: DataTypes.STRING,
        instagram: DataTypes.STRING,
        thumbnail: DataTypes.STRING,
        is_expired: DataTypes.BOOLEAN,
        description: DataTypes.STRING,
        is_available: DataTypes.BOOLEAN,
        is_favorite_event: DataTypes.BOOLEAN,
        representative_user: DataTypes.STRING,
      },
      { sequelize: connection }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}

module.exports = Event;
