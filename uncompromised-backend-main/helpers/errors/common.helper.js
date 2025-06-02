const errorHandler = (res, message, statusCode, errors = []) => {
  if (!Array.isArray(errors)) {
    errors = [errors];
  }

  return res.status(statusCode).json({
    success: false,
    message: message || 'Something went wrong',
    data: null,
    error: { details: errors }
  });
};

const DbErrorHandler = (error, customMessages) => {
  if (!error?.errors || !error?.isDataBaseError) {
    // Return the error as-is if it doesn't meet the expected structure
    return error;
  }

  return error?.errors?.map(detail => {
    if (customMessages[detail.field]) {
      return {
        ...detail,
        message: customMessages[detail.field]
      };
    }
    return detail;
  });
};

module.exports = { errorHandler, DbErrorHandler };
