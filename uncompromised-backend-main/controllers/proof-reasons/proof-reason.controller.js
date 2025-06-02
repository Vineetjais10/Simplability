const proofReasonRepo = require('../../repositories/proof-reason.repository');
const { StatusCodes } = require('http-status-codes');

const index = async function (req, res) {
  try {
    const reasons = await proofReasonRepo.index();
    return res.success(reasons, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

module.exports = { index };
