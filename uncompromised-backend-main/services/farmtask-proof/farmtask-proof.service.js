const { StatusCodes } = require('http-status-codes');

const farmTaskProofRepo = require('../../repositories/farmtask-proof.repository');
const farmTaskRepo = require('../../repositories/farm-task.repository');
const { getFileType } = require('../../helpers/farmtask-proof/farmtask-proof.helper');
const { sequelize, FarmTask, ProofLogs, FarmTaskProof, ProofMedia } = require('../../models');
const proofMediaRepo = require('../../repositories/proofmedia.repository');
const proofLogsRepo = require('../../repositories/proof-logs.repository');

const { uploadToS3, deleteFromS3 } = require('../../helpers/aws/s3.helper');

const create = async (payload, file) => {
  const transaction = await sequelize.transaction();

  let s3Url = '';
  const logData = [];

  try {
    const farmTask = await FarmTask.findOne({
      where: { id: payload.farmtask_id },
      transaction
    });

    if (!farmTask) {
      const error = new Error('FarmTask not found');
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }

    const existingProof = await farmTaskProofRepo.proofByFarmTaskId(payload.farmtask_id, transaction);
    if (existingProof) {
      const error = new Error('Proof already exists for this FarmTask');
      error.code = StatusCodes.CONFLICT;
      throw error;
    }

    const imagePath = `farmTaskProof/${payload.farmtask_id}/${Date.now()}-${file.originalname}`;
    s3Url = await uploadToS3(file, imagePath);

    const proofData = {
      farmtask_id: payload.farmtask_id,
      comments: payload.comments,
      type: payload.type
    };

    const farmTaskProof = await farmTaskProofRepo.createFarmTaskProof(proofData, transaction);
    logData.push({ new_data: farmTaskProof, resource: 'farmtask_proofs' });

    const mediaType = getFileType(file.mimetype);

    const proofMediaData = [
      {
        proof_id: farmTaskProof.id,
        type: mediaType,
        path: s3Url
      }
    ];

    const proofMedia = await proofMediaRepo.createProofMedia(proofMediaData, transaction);
    proofMedia.id = proofMedia[0].id;
    logData.push({ new_data: proofMedia, resource: 'proof_medias' });

    const proofLogData = {
      proof_id: farmTaskProof.id,
      log: {
        comments: farmTaskProof.comments,
        path: proofMedia.path,
        type: farmTaskProof.type,
        file_type: proofMedia[0].type
      }
    };

    await proofLogsRepo.createProofLog(proofLogData, transaction);
    await farmTaskRepo.update(payload.farmtask_id, { task_status: payload.type }, transaction);
    await transaction.commit();
    return {
      farmTaskProof,
      proofMedia,
      logData
    };
  } catch (error) {
    await transaction.rollback();
    if (s3Url) deleteFromS3(s3Url.split('/').slice(-2).join('/'));
    throw error;
  }
};

const update = async (proofId, payload) => {
  const transaction = await sequelize.transaction();
  try {
    let s3Url = '';
    let proofMediaData = [];
    const oldProofMediaData = await ProofMedia.findOne({ where: { proof_id: proofId } });

    const proof = await farmTaskProofRepo.findProofById(proofId);

    if (!proof) {
      const error = new Error('Proof not found!');
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }

    const logData = [];

    if (payload?.file) {
      const imagePath = `farmTaskProof/${proof.farmtask_id}/${Date.now()}-${payload?.file?.originalname}`;
      s3Url = await uploadToS3(payload?.file, imagePath);

      await ProofMedia.destroy({ where: { proof_id: proofId } }, transaction);
      proofMediaData = [
        {
          proof_id: proofId,
          type: getFileType(payload?.file?.mimetype),
          path: s3Url
        }
      ];
    }

    const proofMedia = await proofMediaRepo.createProofMedia(proofMediaData, transaction);
    const newLogData = { ...proof?.ProofLogs[0]?.log, ...payload };
    newLogData.id = proofId;
    newLogData.file_type = proofMedia[0]?.type;

    delete newLogData?.file?.buffer;
    delete newLogData?.proof_media;

    const proofLogs = await ProofLogs.findOne({
      where: { proof_id: proof.id }
    });

    await ProofLogs.destroy({ where: { id: proofLogs.id } }, transaction);

    await FarmTaskProof.update({ comments: payload.comments, type: payload.type }, { where: { id: proofId } }, transaction);

    await farmTaskProofRepo.createProofLog(proofId, newLogData, transaction);

    const updatedProof = await farmTaskProofRepo.findProofWithMedia(proofId);

    logData.push({ old_data: oldProofMediaData, new_data: proofMedia, resource: 'proof_medias' });
    delete proof?.ProofLogs[0]?.log?.file;
    logData.push({ old_data: proof?.ProofLogs[0].log, new_data: newLogData, resource: 'farmtask_proofs' });
    await farmTaskRepo.update(proof.farmtask_id, { task_status: payload.type }, transaction);
    await transaction.commit();
    return { updatedProof, proofMedia, oldProofMediaData, logData };
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

module.exports = {
  create,
  update
};
