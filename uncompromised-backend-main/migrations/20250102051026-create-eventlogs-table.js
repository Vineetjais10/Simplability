'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_logs', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      api_endpoint: {
        type: Sequelize.STRING,
        allowNull: false
      },
      api_method: {
        type: Sequelize.ENUM('POST', 'GET', 'PUT', 'PATCH', 'DELETE'),
        defaultValue: 'POST',
        allowNull: false
      },
      resource: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resource_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      old_data: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      new_data: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      error: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('event_logs');
  }
};
