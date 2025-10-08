#!/usr/bin/env node

/**
 * Entry point for the Protestos API
 */

require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const HOST = process.env.HOST || '0.0.0.0';
const BASE_PORT = Number(process.env.PORT) || 3000;
const MAX_PORT_ATTEMPTS = 10;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('[server] SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.info('[server] SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('[server] Unhandled rejection at promise', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[server] Uncaught exception:', error);
  process.exit(1);
});

async function startServer(port = BASE_PORT, attempt = 0) {
  try {
    if (attempt === 0) {
      await connectDB();
    }

    const server = app.listen(port, HOST, () => {
      const addressInfo = server.address();
      const activePort = typeof addressInfo === 'object' && addressInfo ? addressInfo.port : port;

      console.log('');
      console.log('[server] Protestos API started');
      console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[server] Started at: ${new Date().toISOString()}`);
      console.log(`[server] Base URL: http://${HOST}:${activePort}`);
      console.log(`[server] Docs URL: http://${HOST}:${activePort}/api-docs`);
      console.log(`[server] Health URL: http://${HOST}:${activePort}/health`);
    });

    server.on('error', (error) => {
      if (error.syscall === 'listen') {
        if (error.code === 'EADDRINUSE') {
          if (attempt < MAX_PORT_ATTEMPTS) {
            const nextPort = port + 1;
            console.warn(`[server] Port ${port} is busy, retrying with port ${nextPort}`);
            startServer(nextPort, attempt + 1);
            return;
          }

          console.error(`[server] Port ${port} is busy and maximum retries reached`);
          process.exit(1);
        }

        if (error.code === 'EACCES') {
          console.error(`[server] Port ${port} requires elevated privileges`);
          process.exit(1);
        }
      }

      console.error('[server] Unexpected error while starting:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('[server] Failed to start the application:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
