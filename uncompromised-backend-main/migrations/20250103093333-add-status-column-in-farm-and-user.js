'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('users', 'status', {
      type: Sequelize.ENUM('active', 'archived'),
      defaultValue: 'active',
      allowNull: false
    });

    await queryInterface.addColumn('farms', 'status', {
      type: Sequelize.ENUM('active', 'archived'),
      defaultValue: 'active',
      allowNull: false
    });
  },

  async down(queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('users', 'status');
    await queryInterface.removeColumn('farms', 'status');
  }
};
