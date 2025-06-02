'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProofLogs extends Model {
    static associate(models) {
      ProofLogs.belongsTo(models.FarmTaskProof, { foreignKey: 'proof_id' });
    }
  }
  ProofLogs.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      proof_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      log: {
        type: DataTypes.JSONB,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'ProofLogs',
      tableName: 'proof_logs'
    }
  );
  return ProofLogs;
};
