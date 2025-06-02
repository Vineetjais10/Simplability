'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FarmTaskProof extends Model {
    static associate(models) {
      FarmTaskProof.belongsTo(models.FarmTask, { foreignKey: 'farmtask_id' });
      FarmTaskProof.hasMany(models.ProofMedia, { foreignKey: 'proof_id' });
      FarmTaskProof.hasMany(models.ProofLogs, { foreignKey: 'proof_id' });
    }
  }
  FarmTaskProof.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      farmtask_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'completed'
      }
    },
    {
      sequelize,
      modelName: 'FarmTaskProof',
      tableName: 'farmtask_proofs'
    }
  );
  return FarmTaskProof;
};
