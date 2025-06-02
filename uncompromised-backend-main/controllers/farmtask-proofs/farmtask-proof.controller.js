const { StatusCodes } = require('http-status-codes');

const { create: serviceCreate, update: serviceUpdate } = require('../../services/farmtask-proof/farmtask-proof.service');
const { farmTaskProofSerializer } = require('../../serializers/farmtask-proof/farmtask-proof.serializer');
const farmProofValidator = require('../../validators/farmtask-proof.validator');
const farmTaskRepo = require('../../repositories/farm-task.repository');
const { logToEventQueue } = require('../../producers/eventlogs.producer');
const { parseValidationErrors } = require('../../helpers/utils/utils.helpers');
const { getPagination, getPaginationMeta } = require('../../helpers/utils/utils.helpers');
const farmTaskProofRepo = require('../../repositories/farmtask-proof.repository');
const commonHelper = require('../../helpers/errors/common.helper');
const errorMessage = require('../../constants/errorMessage.constant');

const create = async (req, res) => {
  try {
    const { farmtask_id, comments, type } = req.body;

    const file = req.file;

    if (!file) {
      return res.error({ error: 'File is required' }, '', StatusCodes.BAD_REQUEST);
    }
    const validationError = farmProofValidator.farmProofSchema.validate(req.body, { abortEarly: false });

    if (validationError.error) {
      throw validationError.error;
    }

    const payload = {
      farmtask_id,
      comments,
      type
    };

    const { farmTaskProof, proofMedia, logData } = await serviceCreate(payload, file);
    logToEventQueue(req, logData);

    const data = {
      farm_task_proof: farmTaskProofSerializer(farmTaskProof, proofMedia)
    };

    return res.success(data, '', StatusCodes.OK);
  } catch (error) {
    if (error.name === 'ValidationError') {
      logToEventQueue(req, { error: { error: error.message }, resource: 'farmtask_proofs' });
      commonHelper.errorHandler(res, 'Validation error', StatusCodes.UNPROCESSABLE_ENTITY, parseValidationErrors(error?.details));
    } else {
      logToEventQueue(req, { error: { error: error.message }, resource: 'farmtask_proofs' });
      return res.error({ details: error.message }, 'Failed during create proof', error.code || StatusCodes.BAD_REQUEST);
    }
  }
};

const index = async (req, res) => {
  try {
    const { farmtask_id } = req.query;
    const userId = req.userId.id;
    const userRoles = req.userId.roles;

    const { limit, offset, page } = getPagination(req.query);

    if (!farmtask_id) {
      return res.error({ error: 'farmTaskId is required' }, '', StatusCodes.BAD_REQUEST);
    }
    const farmTask = await farmTaskRepo.farmTaskById(farmtask_id);

    if (!farmTask) {
      return res.error({ error: 'FarmTask not found' }, '', StatusCodes.NOT_FOUND);
    }

    if (farmTask.user_id !== userId && !userRoles.includes('admin') && !userRoles.includes('planner')) {
      return res.error({ error: 'You are not authorized to view these proofs' }, '', StatusCodes.FORBIDDEN);
    }
    const { rows: proofs, count: totalRecords } = await farmTaskProofRepo.index(farmtask_id, limit, offset);

    if (!proofs || proofs.length === 0) {
      return res.error({ error: 'No proofs found' }, '', StatusCodes.NOT_FOUND);
    }

    const data = proofs.map(proof => farmTaskProofSerializer(proof, proof.dataValues.ProofMedia));
    const meta = getPaginationMeta(totalRecords, limit, page);

    const response = {
      data,
      total: meta.totalRecords,
      current_page: meta.currentPage,
      total_pages: meta.totalPages
    };
    return res.success(response, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', error.code || StatusCodes.BAD_REQUEST);
  }
};

const update = async function (req, res) {
  const { id: proofId } = req.params;
  const loggedInUserId = req.userId.id;
  const payload = req.body;

  try {
    if (req.file) {
      payload.file = req.file;
    }

    const validationError = farmProofValidator.farmTaskProofUpdateSchema.validate(payload, { abortEarly: false });

    if (validationError.error) {
      throw validationError.error;
    }

    const proof = await farmTaskProofRepo.findProofById(proofId);

    if (!proof) {
      logToEventQueue(req, { error: { error: 'Proof Not Found!' }, resource: 'farmtask_proofs' });
      return res.error({ error: 'Proof Not Found!' }, '', StatusCodes.NOT_FOUND);
    }
    const { user_id } = await farmTaskRepo.view(proof.farmtask_id);

    if (user_id !== loggedInUserId) {
      logToEventQueue(req, { error: { error: errorMessage.NOT_AUTHORIZE }, resource: 'farmtask_proofs' });
      return res.error({ error: errorMessage.NOT_AUTHORIZE }, '', StatusCodes.FORBIDDEN);
    }

    const serviceData = await serviceUpdate(proofId, payload);
    const { updatedProof, oldProofMediaData, logData } = serviceData;

    const proofMedia = req.file ? serviceData.proofMedia : oldProofMediaData;

    const serializedProof = farmTaskProofSerializer(updatedProof, proofMedia);

    logToEventQueue(req, logData);
    return res.success(serializedProof, 'Proof Updated Successfully!', StatusCodes.OK);
  } catch (error) {
    if (error.name === 'ValidationError') {
      logToEventQueue(req, { error: { error: error.message }, resource: 'farmtask_proofs' });
      commonHelper.errorHandler(res, 'Validation error', StatusCodes.UNPROCESSABLE_ENTITY, parseValidationErrors(error?.details));
    } else {
      logToEventQueue(req, { error: { error: error.message }, resource: 'farmtask_proofs' });
      return res.error({ details: error.message }, '', error.code || StatusCodes.BAD_REQUEST);
    }
  }
};

module.exports = {
  create,
  index,
  update
};
