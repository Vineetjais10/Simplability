const { ProofMedia } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const createProofMedia = async (mediaData, transaction) => {
  try {
    const proofMedia = await ProofMedia.bulkCreate(mediaData, { transaction });
    return proofMedia;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

module.exports = {
  createProofMedia
};
