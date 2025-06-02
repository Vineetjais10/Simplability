const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    static associate() {
      //
    }
  }

  UserRole.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      role_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'UserRole',
      tableName: 'users_roles'
    }
  );

  return UserRole;
};
