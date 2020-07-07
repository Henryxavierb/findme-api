const { DataTypes, Model } = require("sequelize");

class Event extends Model {
  static init(connection) {
    super.init(
      {
        link: DataTypes.STRING,
        theme: DataTypes.STRING,
        owner: DataTypes.STRING,
        photo: DataTypes.STRING,
        photoUrl: {
          type: DataTypes.VIRTUAL,
          get() {
            return this.photo
              ? `${process.env.PHOTO_URL}/files/${this.photo}`
              : null;
          },
        },
        endDate: DataTypes.DATE,
        status: DataTypes.BOOLEAN,
        notify: DataTypes.BOOLEAN,
        youtube: DataTypes.STRING,
        twitter: DataTypes.STRING,
        beginDate: DataTypes.DATE,
        linkedin: DataTypes.STRING,
        instagram: DataTypes.STRING,
        isExpired: DataTypes.BOOLEAN,
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
