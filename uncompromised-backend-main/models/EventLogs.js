'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventLog extends Model {
    static associate(models) {
      EventLog.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  EventLog.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: 'user',
        allowNull: false
      },
      api_endpoint: {
        type: DataTypes.STRING,
        allowNull: false
      },
      api_method: {
        type: DataTypes.ENUM('POST', 'GET', 'PUT', 'PATCH', 'DELETE'),
        defaultValue: 'POST',
        allowNull: false
      },
      resource: {
        type: DataTypes.STRING,
        allowNull: true
      },
      resource_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      old_data: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      new_data: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      error: {
        type: DataTypes.JSONB,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'EventLog',
      tableName: 'event_logs'
    }
  );

  return EventLog;
};
