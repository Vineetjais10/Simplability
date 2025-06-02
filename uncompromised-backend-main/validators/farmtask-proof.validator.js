const Joi = require('joi');

// Joi schema for validating FarmTaskProof
const farmProofSchema = Joi.object({
  farmtask_id: Joi.string().guid().required(),
  comments: Joi.string().allow(null).not(' ').optional().messages({
    'string.empty': "Comments can't be empty string",
    'any.invalid': "Comments can't be empty string"
  }),
  type: Joi.string().valid('completed', 'not_completed', 'not_started').default('completed').required()
});

const farmTaskProofUpdateSchema = Joi.object({
  comments: Joi.string().allow(null).not(' ').optional().messages({
    'string.empty': "Comments can't be empty string",
    'any.invalid': "Comments can't be empty string"
  }),
  type: Joi.string().valid('completed', 'not_completed', 'not_started').required(),
  file: Joi.object({
    fieldname: Joi.string().valid('proof_media').required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    buffer: Joi.binary().required(),
    size: Joi.number()
      .max(100 * 1024 * 1024)
      .required()
  }).optional(),
  proof_media: Joi.string().allow('', null).optional()
});

module.exports = { farmProofSchema, farmTaskProofUpdateSchema };
