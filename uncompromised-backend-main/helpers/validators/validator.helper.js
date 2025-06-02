const { StatusCodes } = require('http-status-codes');

// Validate request data using the JOI schema and throw error if any
function validateRequest(req, schema, reqParameter = 'body') {
  const requestDataMap = {
    body: req.body,
    query: req.query,
    params: req.params
  };

  const requestData = requestDataMap[reqParameter];

  const { value, error } = schema.validate(requestData, { abortEarly: false });

  if (!error) {
    req[reqParameter] = value;
    return;
  }

  const validationError = new Error('Validation error');
  validationError.code = StatusCodes.UNPROCESSABLE_ENTITY;
  validationError.details = error.details.map(detail => ({
    field: detail.context.key,
    message: detail.message.replaceAll('"', '')
  }));

  throw validationError;
}

module.exports = { validateRequest };
