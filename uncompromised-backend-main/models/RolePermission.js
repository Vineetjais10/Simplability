const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate() {
      //
    }
  }

  RolePermission.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      role_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      permission_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'RolePermission',
      tableName: 'role_permissions'
    }
  );

  return RolePermission;
};
