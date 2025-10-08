// src/middleware/logging.js
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info(`Incoming Request: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Outgoing Response: ${req.method} ${req.url} ${res.statusCode}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};

module.exports = requestLogger;