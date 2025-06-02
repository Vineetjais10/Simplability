const moment = require('moment');
const { sequelize } = require('../../models');
const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');

const farmTaskRepo = require('../../repositories/farm-task.repository');
const farmRepo = require('../../repositories/farm.repository');
const cropRepo = require('../../repositories/crop.repository');
const taskRepo = require('../../repositories/task.repository');
const userRepo = require('../../repositories/user.repository');
const roleRepo = require('../../repositories/role.repository');
const farmCropRepo = require('../../repositories/farm-crop.repository');
const { Farm, Task, User, Crop, FarmTask, FarmCrop } = require('../../models');
const { trimString } = require('../../helpers/utils/utils.helpers');
const { COLUMN_HEADINGS } = require('../../constants/columnHeading.constant');
const { logToEventQueue } = require('../../producers/eventlogs.producer');
const redisOperations = require('../redis/redis.service');
const farmTaskProofRepo = require('../../repositories/farmtask-proof.repository');
const { statusUpdateRestriction } = require('../../helpers/farm-task/farm-task.helper');

const createOrUpdate = async function (records, uploadId, userRole) {
  const transactionContext = await sequelize.transaction();
  const logData = [];

  try {
    const dataProcessed = {
      farms: [],
      tasks: [],
      crops: [],
      users: []
    };
    const farmCrops = [];
    const farmTasks = [];

    const redisData = await redisOperations.redisGet(uploadId, true);
    const isRestrictedRole = ['planner', 'field_manager'].includes(userRole?.[0]);
    for (const [, record] of records.entries()) {
      if (record.Farm && trimString(record?.Farm) !== '') {
        if (!isRestrictedRole) {
          dataProcessed.farms.push({
            name: trimString(record?.Farm),
            address: trimString(record[COLUMN_HEADINGS.FARM_ADDRESS]) || null,
            location: trimString(record[COLUMN_HEADINGS.FARM_LOCATION]) || null,
            plot: trimString(record[COLUMN_HEADINGS.PLOT]) || null,
            image_url: trimString(record[COLUMN_HEADINGS.FARM_IMAGE]) || null
          });
        }

        if (record.Task && trimString(record.Task) !== '') {
          dataProcessed.tasks.push({
            name: trimString(record?.Task)
          });
        }

        if (record.Crop && trimString(record.Crop) !== '') {
          dataProcessed.crops.push({
            name: trimString(record?.Crop)
          });
        }

        if (record.Username && trimString(record?.Username) !== '') {
          dataProcessed.users.push({
            name: trimString(record[COLUMN_HEADINGS.ASSIGNED_FIELD_USER]) || null,
            username: trimString(record?.Username)
          });
        }
        if (isRestrictedRole) {
          dataProcessed.farms.push({
            name: trimString(record?.Farm)
          });
        }
      }

      // get Map of crops, tasks and update farm, users
      const bulkFarm = await farmTaskRepo.bulkInsertOrUpdate(Farm, dataProcessed.farms, transactionContext, logData);
      const bulkTask = await farmTaskRepo.bulkInsertOrUpdate(Task, dataProcessed.tasks, transactionContext, logData);
      const bulkCrop = await farmTaskRepo.bulkInsertOrUpdate(Crop, dataProcessed.crops, transactionContext, logData);
      const bulkUser = await farmTaskRepo.bulkInsertOrUpdate(User, dataProcessed.users, transactionContext, logData);

      for (const [, record] of records.entries()) {
        const assignedDate =
          record[COLUMN_HEADINGS.ASSIGNED_DATE] && trimString(record[COLUMN_HEADINGS.ASSIGNED_DATE]) !== ''
            ? new Date(trimString(record[COLUMN_HEADINGS.ASSIGNED_DATE]))
            : null;

        let farmTask;
        if (bulkFarm.get(trimString(record.Farm)) && bulkTask.get(trimString(record.Task))) {
          farmTask = await farmTaskRepo.isDuplicateFarmTaskEntry(
            bulkFarm.get(trimString(record.Farm)),
            bulkTask.get(trimString(record.Task)),
            bulkUser.get(record.Username) || null,
            bulkCrop.get(trimString(record.Crop)) || null,
            assignedDate
          );
        }

        // if farmtask exist then update else push in farmTasks array for creation
        if (!farmTask) {
          if (bulkFarm.get(trimString(record.Farm)) && bulkTask.get(trimString(record.Task))) {
            farmTasks.push({
              farm_id: bulkFarm.get(trimString(record.Farm)),
              task_id: bulkTask.get(trimString(record.Task)),
              user_id: bulkUser.get(trimString(record.Username)) || null,
              crop_id: bulkCrop.get(trimString(record.Crop)) || null,
              assigned_at: assignedDate || farmTask.assigned_at,
              instructions: trimString(record?.Instructions) || null,
              remarks: trimString(record?.Remarks) || null,
              priority: record.Priority && !!trimString(record?.Priority) ? trimString(record?.Priority)?.toLowerCase() : 'normal',
              created_by: redisData?.userId || null
            });

            farmCrops.push({
              farm_id: bulkFarm.get(trimString(record.Farm)),
              crop_id: bulkCrop.get(trimString(record.Crop)) || null
            });
          }
        } else {
          const { farmTask: updatedFarmTask } = await farmTaskRepo.update(
            farmTask.id,
            {
              instructions: trimString(record?.Instructions) || null,
              remarks: trimString(record?.Remarks) || null,
              priority: record.Priority && !!trimString(record?.Priority) ? trimString(record?.Priority)?.toLowerCase() : 'normal'
            },
            transactionContext
          );
          logData.push({ old_data: farmTask, new_data: updatedFarmTask, resource: 'farms_tasks' });
        }
      }
      if (farmTasks.length > 0) {
        const createdFarmTasks = await FarmTask.bulkCreate(farmTasks, {
          transaction: transactionContext,
          returning: true
        });
        logData.push({ new_data: createdFarmTasks, resource: 'farms_tasks' });

        // create farm crops for the farm and crop associated in new farm task
        const existingFarmCrops = await FarmCrop.findAll({
          where: {
            [Op.or]: farmCrops
          },
          attributes: ['farm_id', 'crop_id'],
          transaction: transactionContext
        });

        const existingfarmCropSet = new Set(existingFarmCrops.map(({ farm_id, crop_id }) => `${farm_id}-${crop_id}`));

        const newFarmCrops = farmCrops.filter(({ farm_id, crop_id }) => !existingfarmCropSet.has(`${farm_id}-${crop_id}`));

        if (newFarmCrops.length > 0) {
          const validFarmCrops = newFarmCrops.filter(({ farm_id, crop_id }) => {
            return !!farm_id && !!crop_id;
          });

          if (validFarmCrops.length > 0) {
            const createdFarmCrops = await FarmCrop.bulkCreate(validFarmCrops, {
              transaction: transactionContext,
              returning: true
            });

            logData.push({ new_data: createdFarmCrops, resource: 'farms_crops' });
          }
        }
      }

      await transactionContext.commit();

      logToEventQueue(
        {
          userId: { id: redisData.userId },
          originalUrl: '/api/v1/farms/tasks/upload-csv',
          method: 'POST',
          body: { file: { originalname: redisData.fileName } }
        },
        logData
      );
      return true;
    }
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
};

const index = async function (filters = {}, sorting = {}, pagination = {}, action = null) {
  try {
    const whereConditions = {};

    // Build where conditions
    if (filters.farm) whereConditions['$Farm.name$'] = filters.farm;
    if (filters.task) whereConditions['$Task.name$'] = filters.task;
    if (filters.crop) whereConditions['$Crop.name$'] = filters.crop;
    if (filters.field_supervisor) whereConditions['$User.name$'] = filters.field_supervisor;
    if (filters.field_supervisor_username) whereConditions['$User.username$'] = filters.field_supervisor_username;
    if (filters.assigned_at) {
      const startDate = moment(filters.assigned_at.start).startOf('day').toDate();
      const endDate = moment(filters.assigned_at.end).endOf('day').toDate();
      whereConditions['assigned_at'] = {
        [Op.between]: [startDate, endDate]
      };
    }
    if (filters.priority) {
      whereConditions['priority'] = filters.priority.toLowerCase();
    }
    if (filters.task_status) {
      whereConditions['task_status'] = filters.task_status.toLowerCase();
    }
    if (filters.status) {
      whereConditions['status'] = filters.status.toLowerCase();
    }

    // Map sorting columns to associations
    const columnMapping = {
      farm: [{ model: Farm, as: 'Farm' }, 'name'],
      task: [{ model: Task, as: 'Task' }, 'name'],
      crop: [{ model: Crop, as: 'Crop' }, 'name'],
      user: [{ model: User, as: 'User' }, 'name'],
      assigned_at: 'assigned_at',
      created_at: 'created_at'
    };

    const order = [];
    if (sorting.column && sorting.direction) {
      const mappedColumn = columnMapping[sorting.column];
      if (!mappedColumn) {
        throw new Error(`Invalid sorting column: ${sorting.column}`);
      }
      if (Array.isArray(mappedColumn)) {
        mappedColumn.push(sorting.direction.toUpperCase());
        order.push(mappedColumn);
      } else {
        order.push([mappedColumn, sorting.direction.toUpperCase()]);
      }
    }

    // Pagination
    const limit = pagination.limit || 10;
    const offset = pagination.page ? (pagination.page - 1) * limit : 0;
    const result =
      action && action === 'download' ? await farmTaskRepo.index(whereConditions, order) : await farmTaskRepo.index(whereConditions, order, limit, offset);

    return result;
  } catch (error) {
    console.log('error in index farm task', error);
    throw error;
  }
};

const update = async function (id, payload) {
  const transactionContext = await sequelize.transaction();
  const logData = [];

  try {
    const farmTask = await FarmTask.findOne({
      where: { id }
    });

    if (!farmTask) {
      const error = new Error('Farm Task Not Found');
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }

    if (payload.priority) {
      payload.priority = (payload.priority && payload.priority.trim()) !== '' ? payload.priority.trim().toLowerCase() : farmTask.priority;
    }
    const FarmTaskProof = await farmTaskProofRepo.proofByFarmTaskId(id);

    if (payload.task_status && !(await statusUpdateRestriction(payload, FarmTaskProof, farmTask))) {
      const error = new Error(`Status can't be updated due to some restrictions`);
      error.code = StatusCodes.BAD_REQUEST;
      throw error;
    }
    if (FarmTaskProof) {
      await farmTaskProofRepo.update(FarmTaskProof.id, { type: payload?.task_status }, transactionContext);
    }

    const assignedDate = payload.assigned_at ? new Date(payload.assigned_at) : null;

    if (payload.farm_id && payload.task_id) {
      const isDuplicate = await farmTaskRepo.isDuplicateFarmTaskEntry(
        payload.farm_id,
        payload.task_id,
        payload.user_id ?? null,
        payload.crop_id ?? null,
        assignedDate,
        id
      );

      if (isDuplicate) {
        if (isDuplicate.id !== id) {
          const error = new Error('Farm Task already exist');
          error.code = StatusCodes.BAD_REQUEST;
          throw error;
        }
      }
    }
    const { modifyCount, farmTask: updatedFarmTask } = await farmTaskRepo.update(id, payload, transactionContext);
    logData.push({ old_data: farmTask, new_data: updatedFarmTask, resource: 'farms_tasks' });

    if (modifyCount === 0) {
      const error = new Error('Farm task not Found!');
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    } else {
      const { farmCrop, isCreated } = await farmCropRepo.findOrCreate({ farmId: updatedFarmTask.farm_id, cropId: updatedFarmTask.crop_id }, transactionContext);
      if (isCreated) {
        logData.push({ new_data: farmCrop, resource: 'farms_crops' });
      }
    }

    await transactionContext.commit();
    return { farmTask: updatedFarmTask, logData };
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
};

const create = async function (payload, userId) {
  const transactionContext = await sequelize.transaction();
  const logData = [];

  try {
    const assignedDate = payload.assigned_at ? new Date(payload.assigned_at) : null;

    // Check uniqueness in `farms_tasks`
    const isDuplicate = await farmTaskRepo.isDuplicateFarmTaskEntry(
      payload.farm_id,
      payload.task_id,
      payload.user_id ?? null,
      payload.crop_id ?? null,
      assignedDate
    );
    if (isDuplicate) {
      const error = new Error('Farm Task already exist');
      error.code = StatusCodes.BAD_REQUEST;
      throw error;
    }

    const farmTask = await farmTaskRepo.create(
      {
        farm_id: payload.farm_id,
        task_id: payload.task_id,
        user_id: payload.user_id ? payload.user_id : null,
        crop_id: payload.crop_id ? payload.crop_id : null,
        assigned_at: assignedDate,
        instructions: payload.instructions ? payload.instructions : null,
        remarks: payload.remarks ? payload.remarks : null,
        priority: payload.priority ? payload.priority.toLowerCase().trim() : 'normal',
        status: payload.status ? payload.status : 'published',
        task_status: payload.task_status ? payload.task_status : 'not_started',
        created_by: userId
      },
      transactionContext
    );
    logData.push({ new_data: farmTask, resource: 'farms_tasks' });

    const { farmCrop, isCreated } = await farmCropRepo.findOrCreate({ farmId: farmTask.farm_id, cropId: farmTask.crop_id }, transactionContext);
    if (isCreated) {
      logData.push({ new_data: farmCrop, resource: 'farms_crops' });
    }

    await transactionContext.commit();
    return { farmTask, logData };
  } catch (error) {
    // Rollback transaction on error
    await transactionContext.rollback();
    throw error;
  }
};

const getFilters = async function () {
  const [users, farms, crops, tasks, roles] = await Promise.all([
    userRepo.getAll({ role: 'field_supervisor' }),
    farmRepo.getAll(),
    cropRepo.getAll(),
    taskRepo.getAll(),
    roleRepo.repoIndex(['id', 'name'])
  ]);

  return { field_supervisors: users, farms, crops, tasks, roles };
};

module.exports = { createOrUpdate, index, update, create, getFilters };
