// backend/src/server.js

const app = require('./app');
const env = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port} in ${env.nodeEnv} mode`);
      console.log(`📍 Health check: http://localhost:${env.port}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
      shutdown('unhandledRejection');
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();