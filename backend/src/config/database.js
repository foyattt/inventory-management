// backend/src/config/database.js

const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const prisma = new PrismaClient({
  log: env.isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
  errorFormat: 'pretty',
});

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('Database disconnected');
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
};