'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('farms_tasks', 'task_status', {
      type: Sequelize.ENUM('not_started', 'completed'),
      allowNull: false,
      defaultValue: 'not_started'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('farms_tasks', 'task_status');
  }
};
