'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('farms_tasks', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('farms_tasks', 'created_by');
  }
};
