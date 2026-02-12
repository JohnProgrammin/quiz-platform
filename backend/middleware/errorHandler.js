/**
 * Centralized Error Handler Middleware
 * Catches all errors and formats responses consistently
 */

const logger = require('../services/logger.service');

/**
 * Main error handling middleware
 * Should be the last middleware in the stack
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(
    `${req.method} ${req.path} - ${err.message}`,
    err,
    logger.createContext(req.user?.id, req.path, req.method)
  );

  // Determine status code
  let statusCode = err.statusCode || err.status || 500;
  if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
    statusCode = 500;
  }

  // Format error message
  const isDevelopment = process.env.NODE_ENV === 'development';
  const message = err.message || 'Internal Server Error';
  const errorResponse = {
    error: message,
    status: statusCode,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development
  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack.split('\n').slice(0, 5); // First 5 lines
  }

  // Handle specific error types
  if (err.code === 'ENOENT') {
    errorResponse.error = 'Resource not found';
    statusCode = 404;
  } else if (err.code === 'EACCES') {
    errorResponse.error = 'Permission denied';
    statusCode = 403;
  } else if (err.code === '23505') {
    // PostgreSQL unique constraint violation
    errorResponse.error = 'Resource already exists';
    statusCode = 409;
  } else if (err.code === '23503') {
    // PostgreSQL foreign key violation
    errorResponse.error = 'Invalid reference to related resource';
    statusCode = 400;
  } else if (err.name === 'ValidationError') {
    errorResponse.error = 'Validation failed: ' + err.message;
    statusCode = 400;
  } else if (err.name === 'JsonWebTokenError') {
    errorResponse.error = 'Invalid authentication token';
    statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    errorResponse.error = 'Authentication token has expired';
    statusCode = 401;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper to catch errors in async route handlers
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 * Should be the second-to-last middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.path}`,
    status: 404,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
};
