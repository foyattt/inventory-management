// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create default admin
  await prisma.user.upsert({
    where: { email: 'admin@zesino.com' },
    update: {},
    create: {
      email: 'admin@zesino.com',
      passwordHash,
      fullName: 'System Admin',
      role: 'ADMIN',
    },
  });

  // Default tax rate
  await prisma.systemSetting.upsert({
    where: { key: 'tax_rate' },
    update: {},
    create: {
      key: 'tax_rate',
      value: '15',
      description: 'Default VAT / tax rate percentage',
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });