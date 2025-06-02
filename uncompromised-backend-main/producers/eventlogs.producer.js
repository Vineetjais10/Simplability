const { Queue } = require('bullmq');
const redis = require('../config/redisConfig');
const { queueLogger } = require('../config/loggerConfig');

const isQueueDisabled = process.env.DISABLE_EVENT_LOG_Q === 'true';
const queueName = 'event-logs';
const queue = new Queue(queueName, {
  connection: redis
});

const name = 'eventlog';
// add the event to the queue
const logToEventQueue = async function (req, data) {
  if (isQueueDisabled) return;

  try {
    let payload = req.body;

    if (payload?.password) {
      delete payload.password;
    }
    if (Object.keys(payload).length === 0) {
      payload = null;
    }
    if (payload?.file) {
      payload.file = payload.file?.originalname;
    }
    if (payload?.refresh_token) {
      delete payload.refresh_token;
    }
    if (payload?.new_password && payload?.confirm_password) {
      delete payload?.new_password;
      delete payload?.confirm_password;
    }

    const generateEventLog = function (data) {
      return {
        user_id: req?.userId?.id || data?.user_id || null,
        type: data?.type,
        api_endpoint: req?.originalUrl,
        api_method: req?.method,
        resource: data?.resource || null,
        resource_id: data?.resource_id || data?.old_data?.id || data?.new_data?.id || null,
        payload: payload,
        old_data: data?.old_data || null,
        new_data: data?.new_data || null,
        error: data?.error || null,
        created_at: Date.now()
      };
    };

    if (Array.isArray(data)) {
      await queue.addBulk(data.map(item => ({ name, data: generateEventLog(item) })));
    } else {
      await queue.add(name, generateEventLog(data));
    }
    queueLogger.info(`Added job/s for ${req.method} : ${req?.originalUrl} to the queue`);
  } catch (error) {
    queueLogger.error(`${queueName} --> Error in Queue producer: ${error.message}`);
  }
};

module.exports = { queue, logToEventQueue, queueName };
