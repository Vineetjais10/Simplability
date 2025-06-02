const { Worker } = require('bullmq');
const eventlogRepo = require('../repositories/eventlog.repository');
const { queueName, queue } = require('../producers/eventlogs.producer');
const redis = require('../config/redisConfig');
const { queueLogger } = require('../config/loggerConfig');
const { sequelize } = require('../models');

const isQueueDisabled = process.env.DISABLE_EVENT_LOG_Q === 'true';
const BATCH_LIMIT = process.env.EVENT_LOG_Q_BATCH_LIMIT || 50;
const PROCESS_INTERVAL = process.env.EVENT_LOG_Q_PROCESS_INTERVAL || 600000;
const TOKEN = 'event-log-worker-1';
let isProcessing = false;

// function to complete a job
const completeJob = async job => await job.moveToCompleted(null, TOKEN, false);

// function to fail a job
const failJob = async (job, error) => await job.moveToFailed(error, TOKEN, false);

// function to process jobs in a batch
const processJobBatch = async jobs => {
  const items = jobs.map(job => job.data);
  let completedJobs = jobs.length;

  try {
    await eventlogRepo.bulkCreate(items);
    await Promise.all(jobs.map(job => completeJob(job)));
    return completedJobs;
  } catch (error) {
    queueLogger.error(`${queueName} --> Batch Error: ${error.message}`);
    // incase of batch error process the jobs singularly and only move the failed job to failed state
    for (const job of jobs) {
      try {
        await eventlogRepo.create(job.data);
        await completeJob(job);
      } catch (individualError) {
        await failJob(job, individualError);
        completedJobs--;
        queueLogger.error(`${queueName} --> Individual job ${job.id} failed: ${individualError.message}`);
      }
    }
  }

  return completedJobs;
};

// function to handle job failure
const handleFailedBatch = async (jobs, error) => {
  queueLogger.error(`${queueName} --> Batch processing failed: ${error.message}`, error);
  await Promise.all(jobs.map(job => failJob(job, error)));
};

// function to accumulate jobs until batch limit
const accumulateJobs = (accumulated, job) => ({
  jobs: [...accumulated.jobs, job],
  shouldProcess: accumulated.jobs.length + 1 >= BATCH_LIMIT
});

// Process jobs in batches
const processJobs = async worker => {
  let accumulated = { jobs: [], shouldProcess: false };
  let totalProcessed = 0;

  try {
    while (true) {
      const job = await worker.getNextJob(TOKEN);

      if (!job) {
        if (accumulated.jobs.length > 0) {
          totalProcessed += await processJobBatch(accumulated.jobs);
        }
        return { error: false, totalProcessed };
      }

      accumulated = accumulateJobs(accumulated, job);

      if (accumulated.shouldProcess) {
        totalProcessed += await processJobBatch(accumulated.jobs);
        accumulated = { jobs: [], shouldProcess: false };
      }
    }
  } catch (error) {
    if (accumulated.jobs.length > 0) {
      await handleFailedBatch(accumulated.jobs, error);
    }

    return { error: true, totalProcessed };
  }
};

// process jobs here
const main = async worker => {
  if (isProcessing) return;

  try {
    // db health check
    const [results] = await sequelize.query('SELECT NOW() as current_time');
    if (!results || results?.length === 0) {
      return;
    }

    isProcessing = true;
    const processed = await processJobs(worker);
    if (processed.error) {
      await main(worker);
    }
    queueLogger.info(`${queueName} --> Processed ${processed.totalProcessed} items`);
  } catch (error) {
    queueLogger.error(`${queueName} --> Processing cycle failed: ${error.message}`);
  } finally {
    isProcessing = false;
  }
};

// create worker and start processing
const createWorker = () => {
  const worker = new Worker(queueName, null, {
    connection: redis,
    autorun: false,
    lockDuration: 30000,
    concurrency: 1
  });

  // Start processing with interval
  const startProcessing = () => {
    // process if the batch count is greater then batch limit every second
    const batchInterval = setInterval(async () => {
      const jobsCount = await queue.getJobCounts('waiting');
      if (jobsCount?.waiting >= BATCH_LIMIT) {
        main(worker);
      }
    }, 1000);

    // process batch in a particular interval
    const processInterval = setInterval(() => main(worker), PROCESS_INTERVAL);

    worker.on('closing', () => {
      clearInterval(batchInterval);
      clearInterval(processInterval);
    });
  };

  worker.on('error', error => {
    queueLogger.error(`${queueName} --> Error in worker: ${error.message}`);
  });

  return {
    start: startProcessing
  };
};

let worker;

if (!isQueueDisabled) {
  worker = createWorker();
  worker.start();
}
