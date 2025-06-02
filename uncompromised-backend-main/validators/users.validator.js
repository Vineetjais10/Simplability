const Joi = require('joi');
const commonHelper = require('../helpers/errors/common.helper');
const { PHONE_REGEX } = require('../constants/validation.constant');
const { logToEventQueue } = require('../producers/eventlogs.producer');

const userValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().max(50).optional().messages({
      'string.max': 'Name can have a maximum of 50 characters'
    }),
    username: Joi.string().alphanum().required().messages({
      'string.alphanum': 'Username must be alphanumeric (e.g., user123).',
      'any.required': 'Username is required'
    }),
    email: Joi.string().allow('', null).email().optional().messages({
      'string.email': 'Please enter a valid email address'
    }),
    password: Joi.string().optional(),
    phone_number: Joi.string().pattern(PHONE_REGEX).optional().messages({
      'string.pattern.base': 'Enter a 10-digit number starting with 6, 7, 8, or 9'
    }),
    profile_image: Joi.string().optional(),
    address: Joi.string().optional(),
    created_by: Joi.string().uuid().optional(),
    role_ids: Joi.array().items(Joi.string().uuid().required()).required().messages({
      'array.base': 'Role IDs must be an array of UUIDs',
      'array.includesRequiredUnknowns': 'Each role ID must be a valid UUID',
      'any.required': 'role_ids is required'
    }),
    status: Joi.string().optional()
  });
  try {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      throw error;
    }
    next();
  } catch (error) {
    logToEventQueue(req, { error: { error: error.details }, resource: 'users' });
    commonHelper.errorHandler(
      res,
      'Validation error',
      422,
      error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message.replaceAll('"', '')
      }))
    );
  }
};

const userUpdateSchema = Joi.object({
  name: Joi.string().max(50).optional().messages({
    'string.max': 'Name can have a maximum of 50 characters'
  }),
  username: Joi.string().alphanum().optional().messages({
    'string.alphanum': 'Username must be alphanumeric (e.g., user123).',
    'any.required': 'Username is required'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please enter a valid email address'
  }),
  password: Joi.string().optional(),
  phone_number: Joi.string().pattern(PHONE_REGEX).allow('', null).optional().messages({
    'string.pattern.base': 'Enter a 10-digit number starting with 6, 7, 8, or 9'
  }),
  profile_image: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).optional(),
  status: Joi.string().optional()
});

const fieldSupervisorUpdateSchema = Joi.object({
  name: Joi.string().max(50).optional().messages({
    'string.max': 'Name can have a maximum of 50 characters'
  }),
  username: Joi.string().alphanum().optional().messages({
    'string.alphanum': 'Username must be alphanumeric (e.g., user123).',
    'any.required': 'Username is required'
  }),
  email: Joi.string().allow('', null).email().optional().messages({
    'string.email': 'Please enter a valid email address'
  }),
  password: Joi.string().optional(),
  phone_number: Joi.string().pattern(PHONE_REGEX).allow('', null).optional().messages({
    'string.pattern.base': 'Enter a 10-digit number starting with 6, 7, 8, or 9'
  }),
  profile_image: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).optional(),
  status: Joi.string().optional()
});

module.exports = {
  userValidation,
  userUpdateSchema,
  fieldSupervisorUpdateSchema
};
