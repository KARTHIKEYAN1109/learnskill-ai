export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong';
  let details = error.details;

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
  }

  if (error.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate resource';
  }

  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    message,
    details,
    stack: isProduction ? undefined : error.stack
  });
};
