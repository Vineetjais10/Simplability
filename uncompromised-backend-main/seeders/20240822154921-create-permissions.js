'use strict';

const { Permission } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    const permissions = [
      { resource: 'user', action: 'create', created_at: new Date(), updated_at: new Date() },
      { resource: 'user', action: 'read', created_at: new Date(), updated_at: new Date() },
      { resource: 'user', action: 'update', created_at: new Date(), updated_at: new Date() },
      { resource: 'user', action: 'delete', created_at: new Date(), updated_at: new Date() },
      { resource: 'user', action: 'view', created_at: new Date(), updated_at: new Date() },
      { resource: 'user', action: 'me', created_at: new Date(), updated_at: new Date() },
      { resource: 'role', action: 'create', created_at: new Date(), updated_at: new Date() },
      { resource: 'role', action: 'read', created_at: new Date(), updated_at: new Date() },
      { resource: 'role', action: 'update', created_at: new Date(), updated_at: new Date() },
      { resource: 'role', action: 'delete', created_at: new Date(), updated_at: new Date() },
      { resource: 'role', action: 'view', created_at: new Date(), updated_at: new Date() },
      { resource: 'permission', action: 'create', created_at: new Date(), updated_at: new Date() },
      { resource: 'permission', action: 'read', created_at: new Date(), updated_at: new Date() },
      { resource: 'permission', action: 'update', created_at: new Date(), updated_at: new Date() },
      { resource: 'permission', action: 'delete', created_at: new Date(), updated_at: new Date() },
      { resource: 'permission', action: 'view', created_at: new Date(), updated_at: new Date() },
      { resource: 'task', action: 'create', created_at: new Date(), updated_at: new Date() },
      { resource: 'task', action: 'read', created_at: new Date(), updated_at: new Date() },
      { resource: 'task', action: 'update', created_at: new Date(), updated_at: new Date() },
      { resource: 'task', action: 'delete', created_at: new Date(), updated_at: new Date() },
      { resource: 'task', action: 'view', created_at: new Date(), updated_at: new Date() },
      { resource: 'crop', action: 'create', created_at: new Date(), updated_at: new Date() },
      { resource: 'crop', action: 'read', created_at: new Date(), updated_at: new Date() },
      { resource: 'crop', action: 'update', created_at: new Date(), updated_at: new Date() },
      { resource: 'crop', action: 'delete', created_at: new Date(), updated_at: new Date() },
      { resource: 'crop', action: 'view', created_at: new Date(), updated_at: new Date() },
      { resource: 'farm', action: 'create', created_at: new Date(), updated_at: new Date() },
      { resource: 'farm', action: 'read', created_at: new Date(), updated_at: new Date() },
      { resource: 'farm', action: 'update', created_at: new Date(), updated_at: new Date() },
      { resource: 'farm', action: 'delete', created_at: new Date(), updated_at: new Date() },
      { resource: 'farm', action: 'view', created_at: new Date(), updated_at: new Date() },
      { resource: 'farm_task', action: 'create', created_at: new Date(), updated_at: new Date() },
      { resource: 'farm_task', action: 'read', created_at: new Date(), updated_at: new Date() },
      { resource: 'farm_task', action: 'update', created_at: new Date(), updated_at: new Date() },
      { resource: 'farm_task', action: 'delete', created_at: new Date(), updated_at: new Date() },
      { resource: 'farm_task', action: 'view', created_at: new Date(), updated_at: new Date() },
      { resource: 'farm-task', action: 'upload_csv', created_at: new Date(), updated_at: new Date() }
    ];

    for (const permission of permissions) {
      await Permission.findOrCreate({
        where: { resource: permission.resource, action: permission.action }, // Check if the permission already exists
        defaults: permission // If not, insert the permission
      });
    }
  },

  async down(queryInterface) {
    // Delete the predefined permissions
    await queryInterface.bulkDelete(
      'permissions',
      {
        resource: ['user', 'role', 'permission', 'task', 'crop', 'farm'],
        action: ['create', 'read', 'update', 'delete', 'view', 'me']
      },
      {}
    );
  }
};
