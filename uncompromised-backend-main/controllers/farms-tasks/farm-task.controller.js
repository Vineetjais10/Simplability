const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const {
  create: serviceCreate,
  index: serviceIndex,
  update: serviceUpdate,
  getFilters: serviceGetFilters
} = require('../../services/farm-task/farm-task.service');

const farmTaskRepo = require('../../repositories/farm-task.repository');
const { farmTaskSerializer } = require('../../serializers/farm-task/farm-task.serializer');
const {
  generateExcelFile,
  convertToExcelData,
  validateFile,
  parseFile,
  validateRecords,
  getFileFromLocal
} = require('../../helpers/farm-task/farm-task.helper');
const redisOperation = require('../../services/redis/redis.service');
const { logToEventQueue } = require('../../producers/eventlogs.producer');
const { createJobsFromFile } = require('../../producers/farm-task.producer');
const { sendEmailToUser } = require('../../helpers/farm-task/farm-task.helper');
const { validateRequest } = require('../../helpers/validators/validator.helper');
const { createFarmTaskSchema, updateFarmTaskSchema } = require('../../validators/farm-task.validator');
const { uploadToS3 } = require('../../helpers/aws/s3.helper');
const { COLUMN_HEADINGS } = require('../../constants/columnHeading.constant');
const { TIMESTAMPS_FORMAT } = require('../../constants/date.constant');

const create = async function (req, res) {
  try {
    validateRequest(req, createFarmTaskSchema);
    const { id: userId } = req.userId;

    const { farmTask, logData } = await serviceCreate(req.body, userId);
    logToEventQueue(req, logData);

    return res.success(farmTask, '', StatusCodes.CREATED);
  } catch (error) {
    if (error?.code === StatusCodes.UNPROCESSABLE_ENTITY) {
      logToEventQueue(req, { error: { error: error.details }, resource: 'farms_tasks' });
      return res.error({ details: error.message }, 'Validation error', error.code);
    }
    logToEventQueue(req, { error: { error: error.message }, resource: 'farms_tasks' });
    return res.error({ error: error.message }, '', error.code || StatusCodes.BAD_REQUEST);
  }
};

const createOrUpdate = async function (req, res) {
  try {
    const { file } = req;
    const userId = req.userId.id;
    const username = req.userId.username;
    const userRole = req.userId.roles;

    if (!file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }
    await validateFile(file);
    const now = moment().format(TIMESTAMPS_FORMAT);
    const csvPath = `uploads/${username}_${now}-${file.originalname}`;
    await uploadToS3(file, csvPath);

    const uploadId = uuidv4();

    await redisOperation.redisSet(uploadId, { progress: 0, error: [], rowProgressed: 0, userId, fileName: file?.originalname });

    let records = await parseFile(file.buffer, file.mimetype);

    if (['planner', 'field_manager'].includes(userRole[0])) {
      records = records.map(record => {
        const updatedRecord = { ...record }; // Create a shallow copy of the record
        delete updatedRecord[COLUMN_HEADINGS.FARM_ADDRESS];
        delete updatedRecord[COLUMN_HEADINGS.FARM_LOCATION];
        delete updatedRecord[COLUMN_HEADINGS.FARM_IMAGE];
        delete updatedRecord[COLUMN_HEADINGS.PLOT];
        return updatedRecord;
      });
    }
    const { errors, isFullFileInvalid } = await validateRecords(records, uploadId);
    if (!isFullFileInvalid) {
      const batchSize = process.env.CSV_UPLOAD_BATCH_LIMIT || 100;
      const localFile = await getFileFromLocal(uploadId);
      createJobsFromFile(localFile, uploadId, errors, records.length, batchSize, userRole);
    }

    sendEmailToUser(file, userId, errors, records);

    return res.success(uploadId, 'csv upload in progress', StatusCodes.CREATED);
  } catch (error) {
    logToEventQueue(req, { error: { error: error.message }, resource: 'farms_tasks' });
    return res.error({ details: error.message }, '', error.code || StatusCodes.BAD_REQUEST);
  }
};

const index = async function (req, res) {
  try {
    const filters = {
      farm: req.query.farm || null,
      assigned_at: req.query.assigned_at ? JSON.parse(req.query.assigned_at) : null,
      task: req.query.task || null,
      field_supervisor: req.query.field_supervisor || null,
      field_supervisor_username: req.query.field_supervisor_username || null,
      priority: req.query.priority || null,
      crop: req.query.crop || null,
      task_status: req.query.task_status || null,
      status: req.query.status || null
    };

    const sorting = {
      column: req.query.sorting?.column || 'created_at',
      direction: req.query.sorting?.direction || 'DESC'
    };

    const pagination = {
      limit: Number(req.query.pagination?.limit) || 10,
      page: Number(req.query.pagination?.page) || 1
    };

    const action = req.query.action || null;

    if (action === 'download') {
      const { rows } = await serviceIndex(filters, sorting, {}, action);
      const fileBuffer = await generateExcelFile(convertToExcelData(rows));
      const dateTime = moment().format('YYYY-MM-DD_HH-mm-ss');
      const filename = `farm_tasks_${dateTime}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.status(200).send(fileBuffer);
    }

    const { rows, count } = await serviceIndex(filters, sorting, pagination);
    const serializedData = farmTaskSerializer(rows);
    return res.status(200).json({
      data: serializedData,
      total: count,
      current_page: pagination.page,
      total_pages: Math.ceil(count / pagination.limit)
    });
  } catch (error) {
    return res.error({ error: error.message }, '', error.code || StatusCodes.BAD_REQUEST);
  }
};

const getStatus = async function (req, res) {
  const { upload_id } = req.params;

  try {
    if (!upload_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Upload ID is required' });
    }

    const status = await redisOperation.redisGet(upload_id);
    if (!status) {
      return res.status(StatusCodes.OK).json({ upload_id, percentage: 100, status: 'Upload complete' });
    }

    const { progress, errors } = JSON.parse(status);

    if (errors && errors.length > 0) {
      const errorMap = errors.reduce((acc, error) => {
        const row = error.row;
        const newErrors = error.errors?.map(e => e.replace(/ at row \d+/, '').trim());

        acc[row] = acc[row] ? [...new Set([...acc[row], ...newErrors])] : newErrors;

        return acc;
      }, {});

      const groupedErrors = Object.keys(errorMap).map(row => ({
        row: parseInt(row),
        errors: errorMap[row]
      }));

      return res.status(StatusCodes.OK).json({
        upload_id,
        percentage: progress || 0,
        status: 'Failed with errors',
        errors: groupedErrors // Return the grouped errors
      });
    }

    return res.json({
      upload_id,
      percentage: progress || 0,
      status: progress === 100 ? 'Upload complete' : 'In progress',
      errors: []
    });
  } catch (error) {
    console.error('Error retrieving upload status:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const remove = async function (req, res) {
  try {
    const { id } = req.params;
    const farmTask = await farmTaskRepo.view(id);
    const isRemoved = await farmTaskRepo.remove(id);
    if (!isRemoved) {
      return res.error({ error: 'Farm Task not found' }, '', StatusCodes.NOT_FOUND);
    }
    logToEventQueue(req, { old_data: farmTask, resource: 'farms_tasks' });
    return res.success({}, '', StatusCodes.OK);
  } catch (error) {
    logToEventQueue(req, { error: { error: error.message }, resource: 'farms_tasks' });
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const update = async function (req, res) {
  try {
    validateRequest(req, updateFarmTaskSchema);
    const { id } = req.params;
    const { farmTask, logData } = await serviceUpdate(id, req.body);
    if (!farmTask) {
      return res.error({ error: 'Farm not found' }, '', StatusCodes.NOT_FOUND);
    }
    logToEventQueue(req, logData);

    return res.success(farmTask, 'Farm updated successfully', StatusCodes.OK);
  } catch (error) {
    if (error?.code === StatusCodes.UNPROCESSABLE_ENTITY) {
      logToEventQueue(req, { error: { error: error.details }, resource: 'farms_tasks' });
      return res.error({ details: error.message }, 'Validation error', error.code);
    }
    logToEventQueue(req, { error: { error: error.message }, resource: 'farms_tasks' });
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const view = async function (req, res) {
  try {
    const { id } = req.params;
    const farm_task = await farmTaskRepo.view(id);
    const serializedData = farmTaskSerializer(farm_task);

    return res.success(serializedData, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.NOT_FOUND);
  }
};

const getFilters = async function (req, res) {
  try {
    const filtersData = await serviceGetFilters();
    return res.success(filtersData, '', StatusCodes.OK);
  } catch (error) {
    console.log(error);
    return res.error({ error: error.message }, '', error.code || StatusCodes.BAD_REQUEST);
  }
};

module.exports = {
  createOrUpdate,
  index,
  getStatus,
  remove,
  view,
  update,
  create,
  getFilters
};
