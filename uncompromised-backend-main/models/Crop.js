const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Crop extends Model {
    static associate(models) {
      Crop.belongsToMany(models.Farm, {
        through: 'farms_crops',
        foreignKey: 'crop_id',
        otherKey: 'farm_id'
      });
    }
  }

  Crop.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    },
    {
      sequelize,
      modelName: 'Crop',
      tableName: 'crops'
    }
  );

  return Crop;
};
