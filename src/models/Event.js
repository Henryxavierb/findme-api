const { DataTypes, Model } = require("sequelize");

class Event extends Model {
  static init(connection) {
    super.init(
      {
        endDate: DataTypes.DATE,
        beginDate: DataTypes.DATE,
        link: DataTypes.STRING,
        theme: DataTypes.STRING,
        owner: DataTypes.STRING,
        image: DataTypes.STRING,
        status: DataTypes.STRING,
        notify: DataTypes.BOOLEAN,
        youtube: DataTypes.STRING,
        twitter: DataTypes.STRING,
        linkedin: DataTypes.STRING,
        instagram: DataTypes.STRING,
        description: DataTypes.STRING,
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
