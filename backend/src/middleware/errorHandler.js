// src/middleware/errorHandler.js
const winston = require('winston');

// Create logger for error handling
const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors(),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'protestos-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

/**
 * Error handling middleware for application errors
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  errorLogger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Set status code based on error type
  const statusCode = err.statusCode || 500;
  
  // Prepare error response
  const errorResponse = {
    success: false,
    message: statusCode === 500 ? 'Erro interno do servidor' : err.message,
    timestamp: new Date().toISOString(),
    path: req.url
  };

  // Add stack trace in development environment
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware to handle 404 errors for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Rota não encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware to handle validation errors from Joi or other validators
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err.isJoi || (err && err.name === 'ValidationError')) {
    const errors = [];
    
    if (err.isJoi) {
      // Handle Joi validation errors
      err.details.forEach(detail => {
        errors.push({
          field: detail.path.join('.'),
          message: detail.message
        });
      });
    } else if (err.errors) {
      // Handle Sequelize validation errors
      err.errors.forEach(error => {
        errors.push({
          field: error.path,
          message: error.message
        });
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors,
      timestamp: new Date().toISOString()
    });
  }
  
  next(err);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  validationErrorHandler
};