const { Readable } = require('stream');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const moment = require('moment');
const { DATE_FORMAT, DATE_TIME_FORMAT } = require('../../constants/date.constant');
const { EXPECTED_COLUMNS, ALLOWED_COLUMNS, ALLOWED_PRIORITY, OPTIONAL_COLUMNS } = require('../../constants/expectedColumns.constant');
const redisOperation = require('../../services/redis/redis.service');
const fs = require('fs');
const path = require('path');
const { queueLogger } = require('../../config/loggerConfig');
const { sendMail } = require('../../helpers/notifications/mail.helper');
const userRepo = require('../../repositories/user.repository');
const { FILE_MIME_TYPE } = require('../../constants/common.constant');
const { COLUMN_HEADINGS } = require('../../constants/columnHeading.constant');
const { trimString } = require('../../helpers/utils/utils.helpers');
const { User, Farm, Crop, Task } = require('../../models');

const safeTrim = value => (value && typeof value === 'string' ? value.trim() : String(value || '').trim());

const parseDate = value => {
  if (value instanceof Date) {
    // Already a JS Date object
    return `${value.getMonth() + 1}/${value.getDate()}/${value.getFullYear()}`; // MM/DD/YYYY
  } else if (typeof value === 'number') {
    // Convert Excel serial number to JS Date
    const date = new Date((value - 25569) * 86400 * 1000); // Excel adjustment
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }
  return safeTrim(value); // For strings or non-numeric values
};

const parseHeaderFromFile = async (buffer, mimeType) => {
  const headers = [];
  return new Promise((resolve, reject) => {
    try {
      if (mimeType === 'text/csv') {
        const stream = Readable.from(buffer); // Create the readable stream

        stream
          .pipe(
            csv({
              mapHeaders: ({ header }) => safeTrim(header)
            })
          )
          .on('headers', headerList => {
            headers.push(...headerList); // Push headers into the array
          })
          .on('data', () => {})
          .on('end', () => {
            resolve(headers);
          })
          .on('error', error => {
            reject(error);
          });
      } else if (
        mimeType === 'application/vnd.ms-excel' || // .xls
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
      ) {
        // Handle Excel file
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Use the first sheet
        const sheet = workbook.Sheets[sheetName];

        // Fetch the headers from the first row
        const firstRow = xlsx.utils.sheet_to_json(sheet, { header: 1 })[0] || [];
        headers.push(...firstRow); // Add headers to the array
        resolve(headers); // Resolve with headers for Excel
      } else {
        reject(new Error('Unsupported file type'));
      }
    } catch (error) {
      console.error('Error in parseHeaderFromFile:', error); // Debugging line for catching any error
      reject(error);
    }
  });
};

const parseFile = async (buffer, mimeType, batchSize = 100, isLocal = false) => {
  const seen = new Set();
  const results = [];
  let currentBatch = [];

  const processBatch = batch => {
    const batchResults = [];
    batch.forEach(row => {
      const uniqueKey = isLocal ? generateRowKeyForLocal(row) : generateRowKey(row);
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        batchResults.push(getObjectFromRow(row));
      }
    });
    results.push(...batchResults);
  };

  return new Promise((resolve, reject) => {
    try {
      if (mimeType === 'text/csv') {
        const stream = Readable.from(buffer);

        stream
          .pipe(
            csv({
              mapHeaders: ({ header }) => safeTrim(header)
            })
          )
          .on('data', row => {
            currentBatch.push(row);
            if (currentBatch.length === batchSize) {
              processBatch([...currentBatch]);
              currentBatch = [];
            }
          })
          .on('end', async () => {
            if (currentBatch.length > 0) {
              processBatch([...currentBatch]);
            }
            resolve(results);
          })
          .on('error', error => reject(error));
      } else if (
        mimeType === 'application/vnd.ms-excel' || // .xls
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
      ) {
        (async () => {
          const workbook = xlsx.read(buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

          for (const row of rows) {
            currentBatch.push(row);
            if (currentBatch.length === batchSize) {
              processBatch([...currentBatch]);
              currentBatch = [];
            }
          }

          if (currentBatch.length > 0) {
            processBatch([...currentBatch]);
          }

          resolve(results);
        })().catch(error => reject(error));
      } else {
        reject(new Error('Unsupported file type'));
      }
    } catch (error) {
      reject(error);
    }
  });
};

// generate a key from the row fields
const generateRowKey = function (row) {
  return `${safeTrim(row.Category)}|${safeTrim(row.Farm)}|${safeTrim(row['Field User Id'])}|${safeTrim(row.Crop)}|${parseDate(row['Assigned Date'])}`;
};

const generateExcelFile = async function (data) {
  // Create a new worksheet
  const ws = xlsx.utils.json_to_sheet(data);

  // Create a new workbook and append the worksheet
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Farm Tasks');

  // Write to buffer and return it
  const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
  return buffer;
};

const convertToExcelData = function (data) {
  return data.map(({ id, Task, Farm, Crop, User, assigned_at, instructions, remarks, priority }) => ({
    Id: id,
    Category: Task?.name,
    Farm: Farm?.name,
    Crop: Crop?.name || null,
    'Field User': User?.name || null,
    'Field User Id': User?.username || null,
    'Assigned Date': moment(assigned_at).format(DATE_FORMAT) || null,
    Details: instructions || null,
    'Special Instructions': remarks || null,
    Priority: priority || null,
    [COLUMN_HEADINGS.FARM_ADDRESS]: Farm?.address || null,
    'Farm Location': Farm?.location || null,
    'Farm Image': Farm?.image_url || null,
    Plot: Farm?.plot || null
  }));
};

const convertToExcelDataWithError = async function (records, errors, file) {
  const headersCheck = await parseHeaderFromFile(file.buffer, file.mimetype);

  const errorMap = errors.reduce((acc, error) => {
    const row = error.row;
    const newErrors = error.errors?.map(e => e.replace(/ at row \d+/, '').trim());

    acc[row] = acc[row] ? [...acc[row], ...newErrors] : newErrors;
    return acc;
  }, {});

  const { TASK, FARM, CROP, ASSIGNED_FIELD_USER, USERNAME, ASSIGNED_DATE, INSTRUCTIONS, REMARKS, PRIORITY, FARM_ADDRESS, FARM_LOCATION, FARM_IMAGE, PLOT } =
    COLUMN_HEADINGS;
  const fieldMapping = {
    Category: TASK,
    Farm: FARM,
    Crop: CROP,
    'Field User': ASSIGNED_FIELD_USER,
    'Field User Id': USERNAME,
    'Assigned Date': ASSIGNED_DATE,
    Details: INSTRUCTIONS,
    'Special Instructions': REMARKS,
    Priority: PRIORITY,
    [COLUMN_HEADINGS.FARM_ADDRESS]: FARM_ADDRESS,
    'Farm Location': FARM_LOCATION,
    'Farm Image': FARM_IMAGE,
    Plot: PLOT
  };

  return records.map((record, index) => {
    const row = index + 1;
    const mappedRecord = Object.keys(fieldMapping).reduce((acc, key) => {
      const field = fieldMapping[key];

      if (headersCheck.includes(key)) {
        acc[key] = field === ASSIGNED_DATE ? moment(record[ASSIGNED_DATE]).format(DATE_FORMAT) : record[field];
      }

      return acc;
    }, {});
    mappedRecord.Errors = errorMap[row]?.join(', ') || '';

    return mappedRecord;
  });
};

const getObjectFromRow = function (row) {
  const {
    TASK,
    CATEGORY,
    FARM,
    CROP,
    ASSIGNED_FIELD_USER,
    FIELD_USER,
    USERNAME,
    FIELD_USER_ID,
    ASSIGNED_DATE,
    INSTRUCTIONS,
    DETAILS,
    REMARKS,
    SPECIAL_INSTRUCTIONS,
    PRIORITY,
    FARM_ADDRESS,
    FARM_LOCATION,
    FARM_IMAGE,
    PLOT
  } = COLUMN_HEADINGS;
  return {
    Task: row[CATEGORY] || row[TASK],
    Farm: row[FARM]?.toString(),
    Crop: row[CROP],
    'Assigned Field User': row[FIELD_USER] || row[ASSIGNED_FIELD_USER],
    Username: row[FIELD_USER_ID]?.toString() || row[USERNAME]?.toString(),
    'Assigned Date': parseDate(row[ASSIGNED_DATE]),
    // 'User Address': row[USER_ADDRESS], Add this if needed in the future
    Instructions: row[DETAILS] || row[INSTRUCTIONS],
    Remarks: row[SPECIAL_INSTRUCTIONS] || row[REMARKS],
    Priority: row[PRIORITY],
    [COLUMN_HEADINGS.FARM_ADDRESS]: row[FARM_ADDRESS],
    'Farm Location': row[FARM_LOCATION],
    'Farm Image': row[FARM_IMAGE],
    Plot: row[PLOT]
  };
};

const groupTasksByCreator = function (response) {
  return response.map(assign => {
    const groupedTasks = assign.tasks.reduce((group, task) => {
      const creator = task.created_by || 'Unspecified';
      if (!group[creator]) {
        group[creator] = [];
      }
      delete task.created_by;
      group[creator].push(task);
      return group;
    }, {});

    return {
      assigned_at: assign.assigned_at,
      tasks_by_creator: Object.keys(groupedTasks).map(creator => ({
        created_by: creator,
        task_details: groupedTasks[creator]
      }))
    };
  });
};

const validateFile = async function (file) {
  // Parse and Validate CSV Data
  const mimeType = file.mimetype;
  const fileBuffer = file.buffer;
  let headers = await parseHeaderFromFile(fileBuffer, mimeType);

  headers = headers.filter(header => header !== '');

  const uniqueHeaders = new Set(headers);
  if (headers.length !== uniqueHeaders.size) {
    throw new Error('Duplicate Column Headings');
  }

  const expectedColumns = EXPECTED_COLUMNS;
  const optionalColumns = OPTIONAL_COLUMNS;

  const missingColumns = expectedColumns.filter(col => !headers.includes(col));
  const extraColumns = headers.filter(col => col !== 'Id' && !expectedColumns.includes(col) && !optionalColumns.includes(col));

  if (missingColumns.length > 0 || extraColumns.length > 0) {
    throw new Error(
      `Column validation failed! ${missingColumns.length > 0 ? `Missing Columns: ${missingColumns.join(', ')}!` : ''} ${extraColumns.length > 0 ? `Extra Columns: ${extraColumns.join(', ')}` : ''}`
    );
  }
  const records = await parseFile(fileBuffer, mimeType);

  const totalRecords = records.length;

  if (totalRecords === 0) {
    throw new Error('CSV empty , Please Insert Records To Proceed');
  }
  return true;
};

const generateCSVFile = async function (data) {
  const ws = xlsx.utils.json_to_sheet(data);
  const csv = xlsx.utils.sheet_to_csv(ws);
  return csv;
};

const validateRecords = async function (records, uploadId) {
  try {
    const allowedTask = ALLOWED_COLUMNS;
    const errors = [];
    let validRecords = {};
    let invalidCount = 0;
    const totalRecords = records.length;
    const validColumnData = {
      users: new Set(),
      farms: new Set(),
      crops: new Set()
    };

    records?.forEach((record, idx) => {
      const isRowEmpty = Object.values(record).every(value => !value || trimString(value) === '');
      if (isRowEmpty) {
        invalidCount++;
        return;
      }

      const rowErrors = [];
      const farmName = trimString(record?.Farm);
      const taskName = trimString(record?.Task);
      const assignedDate = trimString(record[COLUMN_HEADINGS.ASSIGNED_DATE]) !== '' ? new Date(trimString(record[COLUMN_HEADINGS.ASSIGNED_DATE])) : null;
      const userName = trimString(record?.Username);
      const cropName = trimString(record?.Crop);

      if (!farmName) {
        rowErrors.push('Farm name is required');
      }

      if (!taskName) {
        rowErrors.push('Category name is required');
      } else if (!allowedTask?.includes(taskName)) {
        rowErrors.push("Category doesn't exist");
      }

      if (assignedDate && assignedDate < new Date().setHours(0, 0, 0, 0)) {
        rowErrors.push('Assigned date is in the past');
      }

      const priority = trimString(record?.Priority);
      if (!ALLOWED_PRIORITY.includes(priority?.toLowerCase())) {
        rowErrors.push('Invalid priority');
      }

      if (rowErrors.length > 0) {
        errors.push({ row: idx + 1, errors: rowErrors });
        invalidCount += 1;
        validRecords[idx + 1] = record;

        validColumnData.users.add(userName);
        validColumnData.farms.add(farmName);
        validColumnData.crops.add(cropName);
      } else {
        validRecords[idx + 1] = record;

        validColumnData.users.add(userName);
        validColumnData.farms.add(farmName);
        validColumnData.crops.add(cropName);
      }
    });

    // map for easy access of all columns data from db
    const userMap = await findAllColumnData(User, [...validColumnData.users], 'username');
    const farmMap = await findAllColumnData(Farm, [...validColumnData.farms], 'name');
    const cropMap = await findAllColumnData(Crop, [...validColumnData.crops], 'name');
    const rowMarkedAsError = errors.map(error => error.row);
    // get only those records whose farm, user, and crop exist in db
    validRecords = Object.entries(validRecords)
      .filter(([row, record]) => {
        const rowErrors = [];
        const farmName = trimString(record?.Farm);
        const userName = trimString(record.Username);
        const cropName = trimString(record.Crop);

        if (!farmMap.has(farmName)) rowErrors.push("Farm doesn't exist");
        if (userName && !userMap.has(userName)) rowErrors.push("User doesn't exist");
        if (cropName && !cropMap.has(cropName)) rowErrors.push("Crop doesn't exist");

        if (rowErrors.length > 0) {
          if (!rowMarkedAsError.includes(Number(row))) {
            invalidCount += 1;
          }
          errors.push({ row: Number(row), errors: rowErrors });
          return false;
        }
        return true;
      })
      .filter(([row]) => !rowMarkedAsError.includes(Number(row)))
      .map(([, record]) => record);
    const progress = parseFloat(((invalidCount / totalRecords) * 100).toFixed(2));
    const redisData = await redisOperation.redisGet(uploadId, true);
    await redisOperation.redisSet(uploadId, { ...redisData, progress, errors, rowProgressed: invalidCount });

    // generate file on local only if there are valid rows
    if (invalidCount !== records.length) {
      const newCSVFileBuffer = await generateCSVFile(validRecords);

      const folderPath = './uploads';
      const filePath = `./uploads/validated_records_${uploadId}.csv`;
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      fs.writeFileSync(filePath, newCSVFileBuffer);
    }

    return { success: true, errors, isFullFileInvalid: invalidCount === records.length };
  } catch (error) {
    queueLogger.error(error);
  }
};

const getFileFromLocal = async function (uploadId) {
  const filePath = path.resolve(`./uploads/validated_records_${uploadId}.csv`);

  if (!fs.existsSync(filePath)) {
    queueLogger.error(`File ${filePath} does not exist`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileMimeType = FILE_MIME_TYPE;
  const localFile = {
    buffer: fileBuffer,
    mimetype: fileMimeType
  };

  return localFile;
};

const addErrorsToExcel = async function (records, errorData, file) {
  const errorMap = new Map(errorData?.map(err => [err.row, err.errors.join(' , ')]));

  const updatedRecords = records.map((record, index) => {
    const rowIndex = index + 1;
    if (errorMap.has(rowIndex)) {
      return { ...record, Error: errorMap.get(rowIndex) };
    }
    return { ...record, Error: '' };
  });

  const content = await generateExcelFile(await convertToExcelDataWithError(updatedRecords, errorData, file));
  return content;
};

const sendEmailToUser = async function (file, userId, errorData, records) {
  try {
    const user = await userRepo.view(userId);
    const userEmail = user?.email;

    if (!userEmail) {
      throw new Error('User email not found');
    }

    if (errorData.length > 0) {
      const content = await addErrorsToExcel(records, errorData, file);
      const dateTime = moment().format(DATE_TIME_FORMAT);

      sendMail({
        to: userEmail,
        subject: 'File uploaded with errors',
        message: `File ${file.originalname} uploaded with errors, \n Here is the link to the app: ${process.env.APP_URL}, please check the attached file.`,
        attachments: [
          {
            filename: `farm_tasks_${dateTime}.xlsx`,
            content
          }
        ]
      });
    } else {
      sendMail({
        to: userEmail,
        subject: 'File uploaded successfully',
        message: `File ${file.originalname} uploaded successfully, \n Here is the link to the app: ${process.env.APP_URL}`
      });
    }
  } catch (error) {
    queueLogger.error(`Error in sending email: ${error.message}`);
  }
};

const generateRowKeyForLocal = function (row) {
  return `${safeTrim(row.Task)}|${safeTrim(row.Farm)}|${safeTrim(row.Username)}|${safeTrim(row.Crop)}|${parseDate(row['Assigned Date'])}`;
};

const extractRecords = async (model, records, uniqueField) => {
  const uniqueRecords = [...new Map(records.map(record => [JSON.stringify(record), record])).values()];

  const existingRecords = await model.findAll({
    where: { [uniqueField]: uniqueRecords.map(record => record[uniqueField]) }
  });

  const existingRecordMap = new Map(existingRecords.map(record => [record[uniqueField], record]));
  return { uniqueRecords, existingRecordMap };
};

const filterNewRecords = (uniqueRecords, existingRecordMap, uniqueField) => uniqueRecords.filter(record => !existingRecordMap.has(record[uniqueField]));

const filterRecordsToUpdate = (uniqueRecords, existingRecordMap, uniqueField) => uniqueRecords.filter(record => existingRecordMap.has(record[uniqueField]));

const insertNewRecords = async (model, newRecords, existingRecordMap, uniqueField, transaction) => {
  const insertedRecords = await model.bulkCreate(newRecords, {
    transaction,
    returning: true,
    ignoreDuplicates: true
  });
  insertedRecords.forEach(record => {
    existingRecordMap.set(record[uniqueField], record.id);
  });
};

const updateExistingRecords = async (model, recordsToUpdate, existingRecordMap, uniqueField, transaction, logData) => {
  for (const record of recordsToUpdate) {
    const existingRecord = existingRecordMap.get(record[uniqueField]);
    const [modifyCount, updated] = await model.update(record, { where: { id: existingRecord.id }, returning: true, transaction });
    if (modifyCount > 0) {
      const plainUpdatedData = updated.pop().get({ plain: true });
      const plainExistingRecord = existingRecord.get({ plain: true });
      delete plainUpdatedData?.password;
      delete plainExistingRecord?.password;

      logData.push({ old_data: plainExistingRecord, new_data: plainUpdatedData, resource: getResourceFromModel(model) });
    }
  }
};

const getResourceFromModel = function (model) {
  const modelResourceMap = {
    [User]: 'users',
    [Farm]: 'farms',
    [Crop]: 'crops',
    [Task]: 'tasks'
  };

  return modelResourceMap[model] || '';
};

const findAllColumnData = async (model, data, field) => {
  const foundData = await model.findAll({ where: { [field]: data } });
  return new Map(foundData.map(item => [item[field], item]));
};

const statusUpdateRestriction = async (payload, farmTaskProof, farmTask) => {
  const todayDateAndTime = new Date();
  const todayDate = todayDateAndTime.toISOString().split('T')[0];

  if (!farmTaskProof || payload.task_status === 'not_started' || farmTask.task_status === 'not_started') return true;

  const conditions = {
    isStatusCompleted: payload?.task_status === 'completed',
    isAssignedTodayBeforeSixPM: payload?.task_status && farmTask?.assigned_at?.toISOString()?.split('T')[0] === todayDate && todayDateAndTime.getHours() < 18
  };
  return Object.values(conditions).includes(true);
};

module.exports = {
  parseFile,
  generateExcelFile,
  convertToExcelData,
  convertToExcelDataWithError,
  groupTasksByCreator,
  parseHeaderFromFile,
  validateFile,
  validateRecords,
  generateCSVFile,
  getFileFromLocal,
  sendEmailToUser,
  extractRecords,
  filterNewRecords,
  filterRecordsToUpdate,
  insertNewRecords,
  updateExistingRecords,
  findAllColumnData,
  statusUpdateRestriction
};
