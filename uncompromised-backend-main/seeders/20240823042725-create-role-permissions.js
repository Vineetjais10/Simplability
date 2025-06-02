'use strict';

const { Role, Permission, RolePermission } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    // Fetch all roles and permissions from the database
    const roles = await Role.findAll();
    const permissions = await Permission.findAll();

    // Define role-based permissions logic
    const rolePermissionsLogic = {
      admin: permissions,
      field_supervisor: permissions,
      planner: permissions.filter(
        permission => permission.resource === 'farm_task' // Restrict to 'farm_task' resource only
      ),
      field_manager: permissions
      // 'field manager': permissions.filter(
      //   permission => permission.resource === 'user' && permission.action === 'me' // Farmer only gets the 'me' action for 'user'
      // )
    };

    // Loop through each role and associate permissions based on logic
    for (const role of roles) {
      const permissionsToAssign = rolePermissionsLogic[role.name] || []; // Get permissions for this role
      for (const permission of permissionsToAssign) {
        await RolePermission.findOrCreate({
          where: { role_id: role.id, permission_id: permission.id },
          defaults: { role_id: role.id, permission_id: permission.id }
        });
      }
    }
  },

  async down(queryInterface) {
    // Delete all role-permission associations
    await queryInterface.bulkDelete('role_permissions', null, {});
  }
};
