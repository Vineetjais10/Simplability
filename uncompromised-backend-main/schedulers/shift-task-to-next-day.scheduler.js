const cron = require('node-cron');
const moment = require('moment');
const { FarmTask } = require('../models');
const { Op } = require('sequelize');
const { cronLogger: logger } = require('../config/loggerConfig');
const isSchedulerDisabled = process.env.DISABLE_SHIFT_SCHEDULER === 'true';
const farmTaskRepo = require('../repositories/farm-task.repository');
const { logToEventQueue } = require('../producers/eventlogs.producer');
// cron job to shift all the task with status not_started or not_completed to next day, this will execute at 6pm everyday

if (!isSchedulerDisabled) {
  cron.schedule(
    process.env.CRON_FOR_SHIFT_FARM_TASK || '0 18 * * *',
    async () => {
      try {
        const currentTime = moment.utc();
        const todayStart = currentTime.clone().startOf('day');

        const oldFarmTask = await farmTaskRepo.getTodaysFarmTask(todayStart);

        const logData = [];
        const [modifyCount, newData] = await FarmTask.update(
          {
            assigned_at: todayStart.clone().add(1, 'days').toDate()
          },
          {
            where: {
              assigned_at: {
                [Op.lte]: todayStart.toDate()
              },
              task_status: ['not_started', 'not_completed']
            },
            returning: true
          }
        );

        if (modifyCount === 0) {
          logger.info('No incomplete tasks found for today');
        } else {
          logger.info('Farm tasks shifted to tomorrow successfully');
          logData.push({ new_data: newData, old_data: oldFarmTask, resource: 'farms-tasks', type: 'cron' });
          logToEventQueue({ originalUrl: '/api/v1/farms/tasks/', method: 'PATCH', body: {} }, logData);
        }
        return true;
      } catch (error) {
        logger.error(error, 'Error shifting task to next day');
      }
    },
    {
      timezone: 'Asia/Kolkata'
    }
  );
}
