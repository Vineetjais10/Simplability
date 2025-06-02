const pino = require('pino');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const loggerCache = {
  cron: { logger: null, currentDate: null },
  api: { logger: null, currentDate: null },
  queue: { logger: null, currentDate: null }
};

/**
 * The function `getOrCreateLogger` creates a logger instance for a specific log type and caches it
 * based on the current date.
 * @param logType - The `logType` parameter is used to specify the type of log that you want to create
 * or retrieve. It is used to differentiate between different types of logs, such as error logs, info
 * logs, debug logs, etc.
 * @returns The function `getOrCreateLogger` returns a logger instance for the specified `logType`. If
 * a logger for the current date and log type already exists in the cache, it returns that logger.
 * Otherwise, it creates a new logger, saves it in the cache, and returns it.
 */
function getOrCreateLogger(logType) {
  const today = moment().format('YYYY-MM-DD');
  const cache = loggerCache[logType];

  if (cache.currentDate === today && cache.logger) {
    return cache.logger;
  }

  const folderPath = path.join('logs', today);
  const filePath = path.join(folderPath, `${logType}.log`);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileTransport = pino.transport({
    target: 'pino/file',
    options: { destination: filePath }
  });

  const logger = pino(
    {
      timestamp: pino.stdTimeFunctions.isoTime
    },
    fileTransport
  );

  loggerCache[logType] = {
    logger,
    currentDate: today
  };

  return logger;
}

/**
 * The function `createLoggerProxy` returns an object with methods for logging different types of
 * messages using a specified log type.
 * @param logType - The `logType` parameter in the `createLoggerProxy` function is used to specify the
 * type of logger that should be created or retrieved. This parameter helps in determining which logger
 * instance to use for logging different types of messages such as info, error, warn, debug, and trace.
 * @returns A proxy object with methods for logging different types of messages (info, error, warn,
 * debug, trace) using a logger based on the specified logType.
 */
function createLoggerProxy(logType) {
  return {
    info: (...args) => getOrCreateLogger(logType).info(...args),
    error: (...args) => getOrCreateLogger(logType).error(...args),
    warn: (...args) => getOrCreateLogger(logType).warn(...args),
    debug: (...args) => getOrCreateLogger(logType).debug(...args),
    trace: (...args) => getOrCreateLogger(logType).trace(...args)
  };
}

const cronLogger = createLoggerProxy('cron');
const apiLogger = createLoggerProxy('api');
const queueLogger = createLoggerProxy('queue');

module.exports = {
  cronLogger,
  apiLogger,
  queueLogger
};
