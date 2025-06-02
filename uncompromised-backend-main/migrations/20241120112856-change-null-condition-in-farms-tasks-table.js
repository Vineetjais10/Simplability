'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('farms_tasks', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true
    });

    await queryInterface.changeColumn('farms_tasks', 'crop_id', {
      type: Sequelize.UUID,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('farms_tasks', 'user_id', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('farms_tasks', 'crop_id', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
