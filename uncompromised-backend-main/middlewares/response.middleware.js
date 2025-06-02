module.exports = (req, res, next) => {
  res.success = (data, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message,
      data,
      error: null
    });
  };

  res.error = (error, message = 'An error occurred', statusCode = 500) => {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      error
    });
  };

  next();
};
