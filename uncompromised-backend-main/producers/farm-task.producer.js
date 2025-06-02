const { Queue } = require('bullmq');
const redis = require('../config/redisConfig');
const { parseFile } = require('../helpers/farm-task/farm-task.helper');
const { queueLogger } = require('../config/loggerConfig');

const queueName = 'farm-task-csv';
const queue = new Queue(queueName, { connection: redis });

const createJobsFromFile = async (file, uploadId, errors, totalRecords, batchSize = 100, userRole) => {
  try {
    const parsedData = await parseFile(file.buffer, file.mimetype, batchSize, true);

    for (let i = 0; i < parsedData.length; i += batchSize) {
      const chunk = parsedData.slice(i, i + batchSize);

      await queue.add(
        'parseBatch',
        {
          data: chunk,
          uploadId,
          errors,
          totalRecords,
          userRole
        },
        { removeOnComplete: true }
      );
    }
  } catch (error) {
    queueLogger.error('Error while enqueuing jobs:', error.message);
    throw error;
  }
};

module.exports = { createJobsFromFile, queueName, queue };
