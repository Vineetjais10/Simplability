const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FarmCrop extends Model {
    static associate() {
      //
    }
  }

  FarmCrop.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      farm_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      crop_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'FarmCrop',
      tableName: 'farms_crops'
    }
  );

  return FarmCrop;
};
