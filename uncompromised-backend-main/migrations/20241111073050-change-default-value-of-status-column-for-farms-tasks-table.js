'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('farms_tasks', 'status', {
      type: Sequelize.ENUM('draft', 'published'),
      defaultValue: 'published',
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('farms_tasks', 'status', {
      type: Sequelize.ENUM('draft', 'published'),
      defaultValue: 'draft',
      allowNull: false
    });
  }
};
