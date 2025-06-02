const { sequelize } = require('../../models');
const farmRepo = require('../../repositories/farm.repository');
const cropRepo = require('../../repositories/crop.repository');
const farmCropRepo = require('../../repositories/farm-crop.repository');
const farmTaskRepo = require('../../repositories/farm-task.repository');
const { groupTasksByCreator } = require('../../helpers/farm-task/farm-task.helper');
const { uploadToS3, deleteFromS3 } = require('../../helpers/aws/s3.helper');
const status = require('../../constants/status.constant');

const create = async function (createBody) {
  const transactionContext = await sequelize.transaction();

  const payload = createBody.body;
  const image = createBody.file;
  let s3_image_url = '';
  const logData = [];

  try {
    if (image && payload.image_url) throw new Error('Image url and Image Both not allowed');

    if (image) {
      s3_image_url = await uploadToS3(image, `farm_images/${Date.now()}-${image.originalname}`);
    }

    // Optional: Add any extra validation or transformations here
    const farm = await farmRepo.create(
      {
        name: payload.name.trim(),
        image_url: payload.image_url || s3_image_url || '',
        address: payload.address || '',
        location: payload.location || '',
        plot: payload.plot || ''
      },
      transactionContext
    );

    logData.push({ new_data: farm, resource: 'farms' });

    let crops = [];
    if (payload.crop_ids) {
      crops = await cropRepo.findByIds(payload.crop_ids);
      if (crops.length === 0) {
        throw new Error("Crops don't exist");
      }
    }
    // Assign crops to the farm
    for (const crop of crops) {
      const farmCrop = await farmCropRepo.create({ farmId: farm.id, cropId: crop.id }, transactionContext);
      logData.push({ new_data: farmCrop, resource: 'farms_crops' });
    }

    await transactionContext.commit();
    return { farm, logData };
  } catch (error) {
    // Rollback transaction on error
    await transactionContext.rollback();
    if (s3_image_url) deleteFromS3(s3_image_url.split('/').slice(-2).join('/'));
    throw error;
  }
};

const update = async function (id, updateBody) {
  const transactionContext = await sequelize.transaction();
  const payload = updateBody.body;
  const image = updateBody.file;
  let s3_image_url = '';
  const logData = [];

  try {
    const crop_ids = payload.crop_ids || [];
    const farm = await farmRepo.view(id);
    if (!farm) {
      const error = new Error("Farm doesn't exists");
      error.code = 404;
      throw error;
    }
    if (payload.crop_ids) {
      delete payload['crop_ids'];
    }

    if (image && payload.image_url) throw new Error('Image url and Image Both not allowed');

    if (farm.image_url) {
      deleteFromS3(farm.image_url.split('/').slice(-2).join('/'));
    }

    if (image) {
      s3_image_url = await uploadToS3(image, `farm_images/${Date.now()}-${image.originalname}`);
      payload.image_url = s3_image_url;
    }

    const farmData = await farmRepo.update(id, payload, transactionContext);

    logData.push({ old_data: farm, new_data: farmData, resource: 'farms' });

    //get all farm crops
    if (crop_ids && crop_ids.length > 0) {
      const farmCrops = await farmCropRepo.findByFarmId(id);

      await Promise.all(
        farmCrops.map(farmCrop => {
          logData.push({ old_data: farmCrop, resource: 'farms_crops' });
          return farmCropRepo.destroy(farmCrop.id, transactionContext);
        })
      );

      const createdFarmCrops = await Promise.all(crop_ids.map(cropId => farmCropRepo.create({ farmId: id, cropId }, transactionContext)));

      createdFarmCrops.forEach(farmCrop => logData.push({ new_data: farmCrop, resource: 'farms_crops' }));
    }

    await transactionContext.commit();
    return { farmData, logData };
  } catch (error) {
    await transactionContext.rollback();
    if (s3_image_url) deleteFromS3(s3_image_url.split('/').slice(-2).join('/'));
    throw error;
  }
};

const farmDetail = async function (farmId) {
  const farm = await farmRepo.view(farmId);
  if (!farm) {
    const error = new Error("Farm doesn't exists");
    error.code = 404;
    throw error;
  }

  const farmTasks = await farmTaskRepo.farmTaskByFarmId(farmId);

  const groupedResponse = groupTasksByCreator(farmTasks);

  const final_response = {
    ...farm.toJSON(),
    tasks_by_assigned_date: groupedResponse
  };
  return final_response;
};

const removeFarm = async function (farmId) {
  const transactionContext = await sequelize.transaction();
  const logData = [];
  try {
    const farm = await farmRepo.view(farmId);
    if (!farm) {
      throw new Error("Farm doesn't exist");
    }

    const isRemoved = await farmRepo.remove(farmId, transactionContext);
    if (!isRemoved) {
      throw new Error("Farm doesn't exist");
    }
    logData.push({ old_data: farm, resource: 'farms' });

    farm.status = status.STATUS_ARCHIVED;
    await farm.save({ transaction: transactionContext });

    // remove farm task associated with this farm
    const farmTasks = await farmTaskRepo.getByFarmId(farmId);
    await farmTaskRepo.removeByFarmId(farmId, transactionContext);
    farmTasks.forEach(farmtask => logData.push({ old_data: farmtask, resource: 'farms_tasks' }));

    transactionContext.commit();
    return { isRemoved, logData };
  } catch (error) {
    transactionContext.rollback();
    throw error;
  }
};

module.exports = { create, update, farmDetail, removeFarm };
