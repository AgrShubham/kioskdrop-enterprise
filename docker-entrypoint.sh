#!/bin/sh
set -e

echo "==> Running Prisma Database Migrations..."
npx prisma migrate deploy

# Seed if database does not contain SKUs yet
echo "==> Ensuring initial seed data..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  try {
    const count = await prisma.hardwareSKU.count();
    if (count === 0) {
      console.log('Seeding initial data...');
      require('child_process').execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    } else {
      console.log('Database already initialized with ' + count + ' SKUs.');
    }
  } catch (err) {
    console.log('Seed check skipped:', err.message);
  } finally {
    await prisma.\$disconnect();
  }
}
check();
" || true

echo "==> Starting KioskDrop Enterprise Server on port 3000..."
exec "$@"
