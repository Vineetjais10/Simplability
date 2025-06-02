const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FarmTask extends Model {
    static associate(models) {
      FarmTask.belongsTo(models.Farm, { foreignKey: 'farm_id' });
      FarmTask.belongsTo(models.Task, { foreignKey: 'task_id' });
      FarmTask.belongsTo(models.User, { foreignKey: 'user_id' });
      FarmTask.belongsTo(models.Crop, { foreignKey: 'crop_id' });
      FarmTask.hasMany(models.FarmTaskProof, { foreignKey: 'farmtask_id' });
    }
  }

  FarmTask.init(
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
      task_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      crop_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      instructions: {
        type: DataTypes.STRING,
        allowNull: true
      },
      remarks: {
        type: DataTypes.STRING,
        allowNull: true
      },
      priority: {
        type: DataTypes.ENUM('normal', 'moderate', 'critical'),
        defaultValue: 'normal',
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('draft', 'published'),
        defaultValue: 'published',
        allowNull: false
      },
      task_status: {
        type: DataTypes.STRING,
        defaultValue: 'not_started',
        allowNull: false
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'FarmTask',
      tableName: 'farms_tasks'
    }
  );

  return FarmTask;
};
