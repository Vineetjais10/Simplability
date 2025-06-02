const { ProofReason } = require('../models');

const index = async function (attributes) {
  const reasons = await ProofReason.findAll({
    attributes: attributes ? attributes : { exclude: ['deleted_at'] }
  });
  return reasons;
};

module.exports = { index };
