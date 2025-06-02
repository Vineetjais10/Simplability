const Joi = require('joi');
const { URL_REGEX } = require('../constants/validation.constant');

const farmSchema = Joi.object({
  name: Joi.string().max(50).required().messages({
    'string.base': 'Name must be a string.',
    'string.max': 'Name must not exceed 50 characters.',
    'any.required': 'Name is a required field.'
  }),
  image_url: Joi.string().allow('', null).pattern(URL_REGEX).optional().messages({
    'string.base': 'Image URL must be a string.',
    'string.pattern.base': 'Invalid URL format. Please ensure it is a valid HTTP or HTTPS URL.'
  }),
  image: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).max(255).optional().messages({
    'string.base': 'Address must be a string.',
    'string.max': 'Address must not exceed 255 characters.'
  }),
  location: Joi.string().allow('', null).optional().messages({
    'string.base': 'Location must be a string.'
  }),
  plot: Joi.string().allow('', null).max(250).optional().messages({
    'string.base': 'Plot must be a string.',
    'string.max': 'The plot description cannot exceed 250 characters.'
  }),
  status: Joi.string().optional()
});

const farmUpdateSchema = Joi.object({
  name: Joi.string().max(50).optional().messages({
    'string.base': 'Name is a required field.',
    'string.max': 'Name must not exceed 50 characters.'
  }),
  image_url: Joi.string().allow('', null).pattern(URL_REGEX).optional().messages({
    'string.base': 'Image URL must be a string.',
    'string.pattern.base': 'Invalid URL format. Please ensure it is a valid HTTP or HTTPS URL.'
  }),
  image: Joi.string().allow('', null).optional(),
  address: Joi.string().allow('', null).max(255).optional().messages({
    'string.base': 'Address must be a string.',
    'string.max': 'Address must not exceed 255 characters.'
  }),
  location: Joi.string().allow('', null).optional().messages({
    'string.base': 'Location must be a string.'
  }),
  plot: Joi.string().allow('', null).max(250).optional().messages({
    'string.base': 'Plot must be a string.',
    'string.max': 'The plot description cannot exceed 250 characters.'
  }),
  status: Joi.string().optional()
});

module.exports = { farmSchema, farmUpdateSchema };
