const {Model, DataTypes} = require('sequelize');

class User extends Model {
  static init(connection) {
    super.init(
      {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        thumbnail: DataTypes.STRING,
        access_token: DataTypes.STRING,
      },
      {sequelize: connection},
    );
  }

  static associate(models) {
    this.hasMany(models.Event, {foreignKey: 'user_id', as: 'events'});
  }
}

module.exports = User;
