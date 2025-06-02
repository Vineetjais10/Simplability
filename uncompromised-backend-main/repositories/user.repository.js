const { User, Role } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const index = async function (payload, limit, offset) {
  const whereClause = {};

  if (payload.username) whereClause.username = payload.username;
  if (payload.phone_number) whereClause.phone_number = payload.phone_number;
  if (payload.email) whereClause.email = payload.email;

  const users = await User.findAndCountAll({
    attributes: { exclude: ['deleted_at'] },
    include: [
      {
        model: Role,
        attributes: ['name'],
        through: { attributes: [] },
        ...(payload.role ? { where: { name: payload.role } } : {})
      }
    ],
    where: whereClause,
    limit,
    offset,
    order: [['name', 'ASC']]
  });
  return users;
};

const findByEmail = async function (email, transaction) {
  const user = await User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        attributes: ['name'],
        through: { attributes: [] }
      }
    ],
    transaction
  });
  return user;
};

const findByUsername = async function (username, transaction) {
  const user = await User.findOne({
    where: { username },
    include: [
      {
        model: Role,
        attributes: ['name'],
        through: { attributes: [] }
      }
    ],
    transaction
  });
  return user;
};

const findByIdWithRoles = async function (id) {
  const user = await User.findByPk(id, {
    include: [
      {
        model: Role,
        attributes: ['name'],
        through: { attributes: [] }
      }
    ]
  });
  return user;
};

const create = async function (userData, transaction) {
  try {
    const user = await User.create(userData, { transaction: transaction });
    return user;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const view = async function (id, includeRoles = true) {
  let include;
  if (includeRoles) {
    include = [
      {
        model: Role,
        attributes: ['name'],
        through: { attributes: [] }
      }
    ];
  }
  const user = await User.findOne({
    attributes: { exclude: ['deleted_at'] },
    include,
    where: { id }
  });
  return user;
};

const remove = async function (id, transaction) {
  const removedRow = await User.destroy({ where: { id } }, { transaction });
  return !(removedRow === 0);
};

const update = async function (id, payload, transaction) {
  try {
    const [modifyCount, updatedUser] = await User.update(payload, { where: { id: id }, returning: true, transaction });
    return { modifyCount, updatedUser: updatedUser?.pop() };
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const findOrCreateUser = async function (username, payload, transaction) {
  try {
    let updatedUser;
    const [user, isCreated] = await User.findOrCreate({
      where: { username },
      defaults: payload,
      attributes: { exclude: ['password'] },
      transaction
    });

    if (!isCreated) {
      updatedUser = await User.update({ name: payload.name, address: payload.address }, { where: { id: user.id }, returning: true, transaction });
      updatedUser = updatedUser[1]?.pop();
    }

    if (updatedUser) {
      updatedUser = updatedUser.get({ plain: true });
      delete updatedUser.password;
    }

    return { user: updatedUser ? updatedUser : user, oldUser: user, isCreated };
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const getAll = async function (options) {
  const users = await User.findAll({
    attributes: ['id', 'name', 'username'],
    include: [
      {
        model: Role,
        attributes: [],
        through: { attributes: [] },
        ...(options?.role ? { where: { name: options.role } } : {})
      }
    ],
    order: [['name', 'ASC']]
  });
  return users;
};

module.exports = {
  index,
  findByEmail,
  create,
  findByIdWithRoles,
  view,
  remove,
  update,
  findByUsername,
  findOrCreateUser,
  getAll
};
