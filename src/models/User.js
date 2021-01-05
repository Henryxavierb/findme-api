require("dotenv").config();
const { Model, DataTypes } = require("sequelize");

class User extends Model {
  static init(connection) {
    super.init(
      {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        photo: DataTypes.STRING,
        photoUrl: {
          type: DataTypes.VIRTUAL,
          get() {
            return this.photo
              ? `${process.env.APP_URL}/files/${this.photo}`
              : null;
          },
        },
        password: DataTypes.STRING,
        expiredToken: DataTypes.STRING,
      },
      { sequelize: connection }
    );
  }

  static associate(models) {
    this.hasMany(models.Event, {
      foreignKey: "user_id",
      as: "events",
    });
  }
}

module.exports = User;
