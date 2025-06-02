const { sequelize } = require('../../models');
const userRepo = require('../../repositories/user.repository');
const roleRepo = require('../../repositories/role.repository');
const userRoleRepo = require('../../repositories/user-role.repository');
const { generateUsername, generatePasswordFactory } = require('../../helpers/user/user.helper');
const { comparePassword } = require('../../helpers/auth/auth.helper');
const { User } = require('../../models');
const { Op } = require('sequelize');

const create = async function (payload, authUserId) {
  const transactionContext = await sequelize.transaction();
  const { username, password, role_ids: roleIds } = payload;
  const logData = [];

  try {
    const role = await roleRepo.view(roleIds[0]);

    const hashedPassword = await generatePasswordFactory(role.name, password);

    // Optional: Add any extra validation or transformations here
    let user = await userRepo.create(
      {
        username: username.trim() || generateUsername(payload.name?.trim()),
        name: payload.name?.trim() || '',
        email: payload.email || null,
        password: hashedPassword,
        phone_number: payload.phone_number || null,
        created_by: authUserId,
        address: payload.address || null
      },
      transactionContext
    );

    user = user.get({ plain: true });
    delete user.password;
    logData.push({ new_data: user, resource: 'users' });

    let roles = [];
    if (!roleIds) {
      // Assign default role (e.g. Farmer) if no roles are provided
      const role = await roleRepo.findByName(process.env.DEFAULT_ROLE);
      if (!role) {
        throw new Error('Default role not found');
      }
      roles.push(role);
    } else {
      roles = await roleRepo.findByIds(roleIds);
      if (roles.length === 0) {
        throw new Error("Roles don't exist");
      }
    }

    // Assign roles to the user
    const userRoles = await Promise.all(roles.map(role => userRoleRepo.create({ userId: user.id, roleId: role.id }, transactionContext)));
    userRoles.forEach(userRole => logData.push({ new_data: userRole, resource: 'users_roles' }));

    // Commit the transaction if all operations succeed
    await transactionContext.commit();

    const newUser = await userRepo.findByIdWithRoles(user.id);

    return { user: newUser, logData };
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
};

const update = async function (id, payload) {
  const transactionContext = await sequelize.transaction();
  const logData = [];
  try {
    const role_ids = payload.role_ids || [];
    let user = await userRepo.view(id);

    if (!user) {
      const error = new Error("User doesn't exists");
      error.code = 404;
      throw error;
    }

    if (payload.role_ids) {
      delete payload['role_ids'];
    }

    // hash password to be updated
    if (payload?.password) {
      const userRole = user.Roles.map(role => role.name);
      payload.password = await generatePasswordFactory(userRole[0], payload.password);
    }

    let { updatedUser } = await userRepo.update(id, payload, transactionContext);
    // remove sensitive info
    user = user.get({ plain: true });
    delete user.password;
    updatedUser = updatedUser.get({ plain: true });
    const logUpdatedUser = { ...updatedUser };
    delete logUpdatedUser.password;
    logData.push({ old_data: user, new_data: logUpdatedUser, resource: 'users' });

    //get all user roles
    if (role_ids && role_ids.length > 0) {
      const userRoles = await userRoleRepo.findByUserId(id);
      for (const userRole of userRoles) {
        //force delete role permissions
        await userRoleRepo.destroy(userRole.id, transactionContext);
        logData.push({ old_data: userRole, resource: 'users_roles' });
      }
      for (const roleId of role_ids) {
        // create user role
        const userRole = await userRoleRepo.create({ userId: id, roleId: roleId }, transactionContext);
        logData.push({ new_data: userRole, resource: 'users_roles' });
      }
    }
    await transactionContext.commit();

    return { user: updatedUser, logData };
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
};

const updatePassword = async function (userId, payload) {
  const { password, new_password, confirm_password } = payload;

  const user = await userRepo.view(userId);
  if (!user) {
    const error = new Error("User doesn't exists");
    error.code = 404;
    throw error;
  }

  const isAuthorized = await comparePassword(password, user);
  if (!isAuthorized) {
    const error = new Error('unauthorised');
    error.code = 401;
    throw error;
  }

  if (new_password !== confirm_password) {
    const error = new Error('New password and confirm password should match');
    error.code = 400;
    throw error;
  }

  const userRole = user.Roles.map(role => role.name);
  const hashedPassword = await generatePasswordFactory(userRole[0], new_password);

  const { updatedUser } = await userRepo.update(user.id, { password: hashedPassword });

  return { user: updatedUser, oldUser: user };
};

const index = async function (payload, pagination) {
  const transactionContext = await sequelize.transaction();
  try {
    if (payload.username) {
      const isUserExist = await User.findOne({
        where: {
          username: payload.username,
          deleted_at: { [Op.not]: null } // Raw condition for deleted_at IS NOT NULL
        },
        paranoid: false
      });

      if (isUserExist) {
        throw new Error('Username exists, can be in archived state!');
      }
    }

    const { limit, offset } = pagination;
    const users = await userRepo.index(payload, limit, offset);
    transactionContext.commit();
    return users;
  } catch (error) {
    transactionContext.rollback();
    throw error;
  }
};
module.exports = { create, update, updatePassword, index };
