const { Sequelize } = require('sequelize');
const { FarmTask, Farm, Task, User, Crop, FarmTaskProof } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');
const { extractRecords, filterRecordsToUpdate, updateExistingRecords } = require('../helpers/farm-task/farm-task.helper');
const { Op } = require('sequelize');

const create = async function (payload, transaction) {
  try {
    const farmTask = await FarmTask.create(payload, { transaction });
    return farmTask;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const isDuplicateFarmTaskEntry = async function (farmId, taskId, userId, cropId, assignedAt, excludeTaskId) {
  const normalizedAssignedAt = assignedAt ? assignedAt.toISOString().split('T')[0] : null;

  const whereClause = {
    farm_id: farmId,
    task_id: taskId,
    assigned_at: Sequelize.where(Sequelize.fn('DATE', Sequelize.col('assigned_at')), normalizedAssignedAt)
  };

  if (excludeTaskId !== undefined) {
    whereClause.id = { [Op.ne]: excludeTaskId };
  }
  if (userId !== null) {
    whereClause.user_id = userId;
  }
  if (cropId !== null) {
    whereClause.crop_id = cropId;
  }

  const existingEntry = await FarmTask.findOne({ where: whereClause });

  return existingEntry;
};

const index = async function (whereConditions, order, limit, offset) {
  const result = await FarmTask.findAndCountAll({
    where: whereConditions,
    include: [
      { model: Farm, as: 'Farm', attributes: ['name', 'image_url', 'address', 'location', 'plot'] },
      { model: Task, as: 'Task', attributes: ['name'] },
      { model: User, as: 'User', attributes: ['name', 'username'] },
      { model: Crop, as: 'Crop', attributes: ['name'] },
      { model: FarmTaskProof, as: 'FarmTaskProofs', attributes: ['id'], separate: true }
    ],
    subQuery: false,
    distinct: true,
    order: order.length > 0 ? order : [['created_at', 'DESC']],
    limit: limit || undefined,
    offset: offset || undefined
  });

  return result;
};

const remove = async function (id, transaction) {
  const removedRow = await FarmTask.destroy({ where: { id } }, { transaction });
  return !(removedRow === 0);
};

const removeByFarmId = async function (farmId, transaction) {
  const removeFarmtask = await FarmTask.destroy({ where: { farm_id: farmId } }, { transaction });
  return !(removeFarmtask === 0);
};

const getByFarmId = async function (farmId) {
  const farmTasks = await FarmTask.findAll({ where: { farm_id: farmId } });

  return farmTasks;
};

const view = async function (id) {
  const farm_task = await FarmTask.findOne({
    include: [
      { model: Farm, as: 'Farm', attributes: ['name', 'image_url', 'address', 'location', 'plot'] },
      { model: Task, as: 'Task', attributes: ['name'] },
      { model: User, as: 'User', attributes: ['name', 'username'] },
      { model: Crop, as: 'Crop', attributes: ['name'] },
      { model: FarmTaskProof, as: 'FarmTaskProofs', attributes: ['id'] }
    ],
    where: { id }
  });
  return farm_task;
};

const farmTaskById = async function (id) {
  return await FarmTask.findByPk(id);
};

const update = async function (id, payload, transaction) {
  try {
    const [modifyCount, farmTask] = await FarmTask.update(payload, { where: { id: id }, returning: true, transaction });
    return { modifyCount, farmTask: farmTask?.pop() };
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const findOrCreateFarmTask = async function (payload, transaction) {
  try {
    let farmTask,
      isCreated = false;
    [farmTask, isCreated] = await FarmTask.findOrCreate({
      where: { farm_id: payload.farmId, task_id: payload.taskId },
      defaults: payload,
      transaction
    });
    if (!isCreated) {
      if (payload.farmId) {
        delete payload.farmId;
      }

      if (payload.taskId) {
        delete payload.taskId;
      }
      let updatedFarmTask = await FarmTask.update(payload, { where: { id: farmTask.id }, returning: true, transaction });
      updatedFarmTask = updatedFarmTask[1];
      farmTask = updatedFarmTask.pop();
    }
    return farmTask;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const farmTaskByFarmId = async function (farmId) {
  try {
    const farmTasks = await FarmTask.findAll({
      where: { farm_id: farmId },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('assigned_at')), 'assigned_at'],
        [
          Sequelize.literal(`
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'instructions', "FarmTask".instructions,
                'remarks', "FarmTask".remarks,
                'task_status', "FarmTask".task_status,
                'priority', "FarmTask".priority,
                'crop', (
                  SELECT
                  "crops".name
                  FROM "crops"
                  WHERE "crops".id = "FarmTask".crop_id
                ),
                'task', ( 
                SELECT
                  "tasks".name
                  FROM "tasks"
                  WHERE "tasks".id = "FarmTask".task_id
                ),
                'field_supervisor', (
                  SELECT 
                  JSON_BUILD_OBJECT(
                    'username', "users".username,
                    'name', "users".name
                  )
                  FROM "users"
                  WHERE "users".id = "FarmTask".user_id AND "users".deleted_at IS NULL
                ),
                'created_by', (
                  SELECT 
                    "creator".name
                  FROM "users" AS "creator"
                  WHERE "creator".id = "FarmTask".created_by
                )
              )
            )
          `),
          'tasks'
        ]
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('assigned_at'))],
      order: [['assigned_at', 'DESC']],
      raw: true
    });

    return farmTasks;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const bulkInsertOrUpdate = async function (model, records, transaction, logData) {
  const uniqueField = model === User ? 'username' : 'name';
  const { uniqueRecords, existingRecordMap } = await extractRecords(model, records, uniqueField);

  if (model === Farm || model === User) {
    const recordsToUpdate = filterRecordsToUpdate(uniqueRecords, existingRecordMap, uniqueField);
    if (recordsToUpdate.length > 0) {
      await updateExistingRecords(model, recordsToUpdate, existingRecordMap, uniqueField, transaction, logData);
    }
  }

  const updatedRecordMap = new Map([...existingRecordMap.entries()].map(([key, value]) => [key, value.id]));
  return updatedRecordMap;
};

const getTodaysFarmTask = async function (todayStart) {
  const todayFarmTask = await FarmTask.findAll({
    where: {
      assigned_at: {
        [Op.lte]: todayStart.toDate()
      },
      task_status: {
        [Op.in]: ['not_started', 'not_completed']
      }
    }
  });
  return todayFarmTask;
};
module.exports = {
  isDuplicateFarmTaskEntry,
  create,
  index,
  remove,
  view,
  update,
  findOrCreateFarmTask,
  farmTaskByFarmId,
  removeByFarmId,
  getByFarmId,
  farmTaskById,
  bulkInsertOrUpdate,
  getTodaysFarmTask
};
