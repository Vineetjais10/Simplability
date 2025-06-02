'use strict';

const { Task } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    const tasks = [
      { name: 'Field Preparation', created_at: new Date(), updated_at: new Date() },
      { name: 'Sowing', created_at: new Date(), updated_at: new Date() },
      { name: 'Weeding', created_at: new Date(), updated_at: new Date() },
      { name: 'Irrigation', created_at: new Date(), updated_at: new Date() },
      { name: 'Spraying (& Drenching)', created_at: new Date(), updated_at: new Date() },
      { name: 'Harvesting', created_at: new Date(), updated_at: new Date() },
      { name: 'Maintenance', created_at: new Date(), updated_at: new Date() },
      { name: 'Other', created_at: new Date(), updated_at: new Date() }
    ];

    // Loop through the tasks and use findOrCreate to avoid duplicates
    for (const task of tasks) {
      await Task.findOrCreate({
        where: { name: task.name }, // Check if task with the same name already exists
        defaults: task // If not, insert the task with these fields
      });
    }
  },

  async down(queryInterface) {
    // Optionally delete the tasks created by the seed file
    await queryInterface.bulkDelete(
      'tasks',
      {
        name: ['Field Preparation', 'Sowing', 'Weeding', 'Irrigation', 'Spraying (& Drenching)', 'Harvesting', 'Maintenance', 'Other']
      },
      {}
    );
  }
};
