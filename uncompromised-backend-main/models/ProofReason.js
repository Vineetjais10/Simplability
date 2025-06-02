const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProofReason extends Model {
    static associate() {}
  }

  ProofReason.init(
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
      status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'active'
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'ProofReason',
      tableName: 'proof_reasons'
    }
  );

  return ProofReason;
};
