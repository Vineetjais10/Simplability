'use strict';

const { generatePasswordFactory } = require('../helpers/user/user.helper');
const { User, UserRole, Role } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    const password = process.env.ADMIN_PASSWORD;
    const hashedPassword = await generatePasswordFactory('admin', password);

    const [user, isCreated] = await User.findOrCreate({
      where: {
        username: process.env.ADMIN_USERNAME
      },
      defaults: {
        name: process.env.ADMIN_NAME,
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword
      }
    });

    if (isCreated) {
      const adminRole = await Role.findOne({ where: { name: 'admin' } });

      await UserRole.create({
        user_id: user.id,
        role_id: adminRole.id
      });
    }
  },

  async down() {}
};
