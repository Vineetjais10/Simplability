'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Alter the user_id column to make it nullable
    await queryInterface.changeColumn('event_logs', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true
    });

    // Add 'type' column to specify if the event is from a cron job or user
    await queryInterface.addColumn('event_logs', 'type', {
      type: Sequelize.STRING, //  to hold 'user' or 'cron'
      defaultValue: 'user', // Default value is 'user'
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes made in the up method
    await queryInterface.removeColumn('event_logs', 'type');

    await queryInterface.changeColumn('event_logs', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false, // Reverting back to not nullable
      references: {
        model: 'users',
        key: 'id'
      }
    });
  }
};
