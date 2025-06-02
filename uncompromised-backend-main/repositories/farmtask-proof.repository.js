const { FarmTaskProof, ProofLogs, ProofMedia } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const createFarmTaskProof = async (data, transaction) => {
  try {
    const farmTaskProof = await FarmTaskProof.create(data, { transaction });
    return farmTaskProof;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const index = async (farmtask_id, limit, offset) => {
  return FarmTaskProof.findAndCountAll({
    where: { farmtask_id },
    include: [
      {
        model: ProofMedia,
        attributes: ['id', 'type', 'path']
      }
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });
};

const findProofById = async proofId => {
  return FarmTaskProof.findOne({
    where: { id: proofId },
    include: [
      { model: ProofMedia, attributes: ['type', 'path'] },
      { model: ProofLogs, attributes: ['id', 'log'] }
    ]
  });
};

const createProofLog = async (proofId, logData, transaction) => {
  return ProofLogs.create(
    {
      proof_id: proofId,
      log: logData
    },
    { transaction }
  );
};

const findProofWithMedia = async proofId => {
  return FarmTaskProof.findOne({
    where: { id: proofId, deleted_at: null }
  });
};

const proofByFarmTaskId = async (farmTaskId, transaction) => {
  return FarmTaskProof.findOne({ where: { farmtask_id: farmTaskId } }, { transaction });
};

const update = async (proofId, payload, transaction) => {
  try {
    const [modifyCount, farmTaskProof] = await FarmTaskProof.update(payload, { where: { id: proofId }, returning: true, transaction });
    return { modifyCount, farmTaskProof: farmTaskProof?.pop() };
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

module.exports = {
  createFarmTaskProof,
  index,
  findProofById,
  createProofLog,
  findProofWithMedia,
  proofByFarmTaskId,
  update
};
