const { Worker } = require('bullmq');
const redis = require('../config/redisConfig');
const parseService = require('../services/farm-task/farm-task.service');
const { queueName } = require('../producers/farm-task.producer');
const { isTransientError } = require('../helpers/utils/utils.helpers');
const redisOperation = require('../services/redis/redis.service');
const fs = require('fs');
const { queueLogger } = require('../config/loggerConfig');

const worker = new Worker(
  queueName,
  async job => {
    const { data: data, uploadId, errors, totalRecords, userRole } = job.data;
    const filePath = `./uploads/validated_records_${uploadId}.csv`;

    try {
      const redisData = await redisOperation.redisGet(uploadId, true);
      let progress = redisData.progress;

      try {
        await parseService.createOrUpdate(data, uploadId, userRole);
      } catch (error) {
        queueLogger.error(error, error.message);
        data.forEach(async record => {
          try {
            await parseService.createOrUpdate([record], uploadId, userRole);
          } catch (error) {
            queueLogger.error(error, error.message);
          }
        });
      }

      progress = progress + parseFloat(((data.length / totalRecords) * 100).toFixed(2));
      const rowProgressed = redisData.rowProgressed + data.length;
      await redisOperation.redisSet(uploadId, { ...redisData, progress, errors, rowProgressed });

      if (rowProgressed === totalRecords) {
        await redisOperation.redisSet(uploadId, { ...redisData, progress: 100, errors, rowProgressed });

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      queueLogger.error(`Error processing job ID: ${job.id} - ${error.message}`);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (isTransientError(error)) {
        throw error;
      }
    }
  },
  {
    connection: redis
  }
);

worker.on('completed', job => {
  queueLogger.info(`Job with ID: ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  queueLogger.error(`Job with ID: ${job.id} failed. Error: ${err.message}`);
});

worker.on('error', err => {
  queueLogger.error(err, err.message);
});
