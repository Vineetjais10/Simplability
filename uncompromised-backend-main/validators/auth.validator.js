const Joi = require('joi');
const commonHelper = require('../helpers/errors/common.helper');
const { logToEventQueue } = require('../producers/eventlogs.producer');

const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().optional().messages({
      'string.empty': 'Email is required!',
      'string.email': 'Please enter a valid email address'
    }),
    username: Joi.string().optional().messages({
      'string.empty': 'Username is required!'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required!',
      'string.empty': 'Password is required!'
    })
  });

  try {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      throw error;
    }

    if (!req.body.email && !req.body.username) {
      logToEventQueue(req, { error: { error: 'Either email or username must be provided!' }, resource: 'login' });
      return commonHelper.errorHandler(res, 'Validation error', 422, { message: 'Either email or username must be provided!' });
    }
    next();
  } catch (error) {
    logToEventQueue(req, { error: { error: error.message }, resource: 'login' });
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

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required!',
    'string.email': 'Please enter a valid email address'
  })
});

const resetPasswordSchema = Joi.object({
  new_password: Joi.string().required().messages({
    'any.required': 'New Password is required!'
  }),
  confirm_password: Joi.string().required().messages({
    'any.required': 'Confirm Password is required!'
  })
});

module.exports = {
  loginValidation,
  forgotPasswordSchema,
  resetPasswordSchema
};
