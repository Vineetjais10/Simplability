const Joi = require('joi');

const createFarmTaskSchema = Joi.object({
  farm_id: Joi.string().uuid().required().messages({
    'string.base': 'Farm must be a string.',
    'string.guid': 'Farm must be a valid UUID.',
    'any.required': 'Farm is required.'
  }),

  task_id: Joi.string().uuid().required().messages({
    'string.base': 'Category must be a string.',
    'string.guid': 'Category must be a valid UUID.',
    'any.required': 'Category is required.'
  }),

  user_id: Joi.string().uuid().required().messages({
    'string.base': 'User must be a string.',
    'string.guid': 'User must be a valid UUID.',
    'any.required': 'User is required.'
  }),

  crop_id: Joi.string().uuid().required().messages({
    'string.base': 'Crop must be a string.',
    'string.guid': 'Crop must be a valid UUID.',
    'any.required': 'Crop is required.'
  }),

  assigned_at: Joi.date().required().messages({
    'date.base': 'Assigned date must be a valid date.'
  }),

  instructions: Joi.string().optional().messages({
    'string.base': 'Instructions must be a string.'
  }),

  remarks: Joi.string().optional().messages({
    'string.base': 'Remarks must be a string.'
  }),

  priority: Joi.string().required().valid('normal', 'moderate', 'critical').messages({
    'string.base': 'Priority must be a string.',
    'any.only': 'Priority must be one of (Normal, Moderate, Critical).'
  }),

  status: Joi.string().valid('draft', 'published').optional().messages({
    'string.base': 'Status must be a string.',
    'any.only': 'Status must be one of (Draft, Published).'
  }),

  task_status: Joi.string().valid('not_started', 'not_completed', 'completed').optional().messages({
    'string.base': 'Task status must be a string.',
    'any.only': 'Task status must be one of (Not_started, Not_completed, Completed).'
  })
});

const updateFarmTaskSchema = Joi.object({
  farm_id: Joi.string().uuid().optional().messages({
    'string.base': 'Farm must be a string.',
    'string.guid': 'Farm must be a valid UUID.'
  }),

  task_id: Joi.string().uuid().optional().messages({
    'string.base': 'Category must be a string.',
    'string.guid': 'Category must be a valid UUID.'
  }),

  user_id: Joi.string().uuid().optional().messages({
    'string.base': 'User must be a string.',
    'string.guid': 'User must be a valid UUID.'
  }),

  crop_id: Joi.string().uuid().optional().messages({
    'string.base': 'Crop must be a string.',
    'string.guid': 'Crop must be a valid UUID.'
  }),

  assigned_at: Joi.date().optional().messages({
    'date.base': 'Assigned date must be a valid date.'
  }),

  instructions: Joi.string().allow('', null).optional().messages({
    'string.base': 'Instructions must be a string.'
  }),

  remarks: Joi.string().allow('', null).optional().messages({
    'string.base': 'Remarks must be a string.'
  }),

  priority: Joi.string().valid('normal', 'moderate', 'critical').optional().messages({
    'string.base': 'Priority must be a string.',
    'any.only': 'Priority must be one of (Normal, Moderate, Critical).'
  }),

  status: Joi.string().valid('draft', 'published').optional().messages({
    'string.base': 'Status must be a string.',
    'any.only': 'Status must be one of (Draft, Published).'
  }),

  task_status: Joi.string().valid('not_started', 'not_completed', 'completed').optional().messages({
    'string.base': 'Task status must be a string.',
    'any.only': 'Task status must be one of (Not_started, Not_completed, Completed).'
  })
});

module.exports = { createFarmTaskSchema, updateFarmTaskSchema };
