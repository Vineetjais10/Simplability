'use strict';

const { Role } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    const roles = [
      { name: 'field_supervisor', created_at: new Date(), updated_at: new Date() },
      { name: 'planner', created_at: new Date(), updated_at: new Date() },
      { name: 'field_manager', created_at: new Date(), updated_at: new Date() },
      { name: 'admin', created_at: new Date(), updated_at: new Date() }
    ];

    // Loop through the tasks and use findOrCreate to avoid duplicates
    for (const role of roles) {
      await Role.findOrCreate({
        where: { name: role.name }, // Check if task with the same name already exists
        defaults: role // If not, insert the task with these fields
      });
    }
  },

  async down(queryInterface) {
    // Delete the predefined roles
    await queryInterface.bulkDelete(
      'roles',
      {
        name: ['field_supervisor', 'planner', 'field_manager', 'admin']
      },
      {}
    );
  }
};
