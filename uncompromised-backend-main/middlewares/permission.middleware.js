const { StatusCodes } = require('http-status-codes');
const { User, Role, Permission } = require('../models');

// Middleware for checking specific permissions
function authorize(resource, action, allowedRoles = []) {
  return async (req, res, next) => {
    try {
      // Fetch the user with their roles and permissions
      const user = await User.findByPk(req.userId.id, {
        include: {
          model: Role,
          include: [Permission]
        }
      });

      if (!user) return res.error({ error: 'User not found' }, '', StatusCodes.NOT_FOUND);

      // Check if the user has any of the allowed roles
      const userRoles = user.Roles.map(role => role.name);
      const userHasRole = allowedRoles.some(role => userRoles.includes(role));

      if (!userHasRole) {
        return res.error({ error: "You don't have permission to access this resource." }, '', StatusCodes.FORBIDDEN);
      }

      // Check if the user has the specific permission for the resource and action
      // const hasPermission = user.Roles.some(role => role.Permissions.some(permission => permission.resource === resource && permission.action === action));

      // if (!hasPermission) {
      //   return res.error({ error: "You don't have permission to perform this action." }, '', StatusCodes.FORBIDDEN);
      // }

      next();
    } catch (error) {
      return res.error({ error: error.message }, '', StatusCodes.FORBIDDEN);
    }
  };
}

module.exports = authorize;
