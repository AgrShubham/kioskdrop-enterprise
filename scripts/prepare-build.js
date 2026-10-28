const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf-8');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres =
  dbUrl.startsWith('postgres://') ||
  dbUrl.startsWith('postgresql://') ||
  process.env.VERCEL === '1';

if (isPostgres) {
  console.log('==> Detected PostgreSQL / Vercel deployment environment.');
  if (schemaContent.includes('provider = "sqlite"')) {
    console.log('==> Switching Prisma provider from sqlite to postgresql...');
    schemaContent = schemaContent.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schemaContent, 'utf-8');
  }

  console.log('==> Generating Prisma client for PostgreSQL...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // If active database connection is provided, sync schema & seed
  if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
    console.log('==> Pushing schema to remote PostgreSQL database...');
    try {
      execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
      console.log('==> Schema successfully synchronized with PostgreSQL.');
    } catch (err) {
      console.warn('==> Note: prisma db push encountered a warning, continuing build...');
    }
  }
} else {
  console.log('==> Using local SQLite database environment.');
  if (schemaContent.includes('provider = "postgresql"')) {
    console.log('==> Switching Prisma provider to sqlite...');
    schemaContent = schemaContent.replace('provider = "postgresql"', 'provider = "sqlite"');
    fs.writeFileSync(schemaPath, schemaContent, 'utf-8');
  }

  console.log('==> Generating Prisma client for SQLite...');
  execSync('npx prisma generate', { stdio: 'inherit' });
}
