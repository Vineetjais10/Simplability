'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('farms_tasks', 'task_status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'not_started'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('farms_tasks', 'task_status', {
      type: Sequelize.ENUM('not_started', 'not_completed', 'completed'),
      allowNull: false,
      defaultValue: 'not_started'
    });
  }
};
