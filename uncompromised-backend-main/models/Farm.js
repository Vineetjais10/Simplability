const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Farm extends Model {
    static associate(models) {
      Farm.belongsToMany(models.Crop, {
        through: 'farms_crops',
        foreignKey: 'farm_id',
        otherKey: 'crop_id'
      });

      Farm.belongsToMany(models.Task, {
        through: 'farms_tasks',
        foreignKey: 'farm_id',
        otherKey: 'task_id'
      });

      Farm.hasMany(models.FarmTask, { foreignKey: 'farm_id', as: 'FarmTasks' });
    }
  }

  Farm.init(
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
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      location: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      plot: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('active', 'archived'),
        defaultValue: 'active',
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Farm',
      tableName: 'farms'
    }
  );

  return Farm;
};
