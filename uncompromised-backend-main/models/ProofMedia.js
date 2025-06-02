'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProofMedia extends Model {
    static associate(models) {
      ProofMedia.belongsTo(models.FarmTaskProof, { foreignKey: 'proof_id' });
    }
  }
  ProofMedia.init(
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
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'ProofMedia',
      tableName: 'proof_medias'
    }
  );
  return ProofMedia;
};
