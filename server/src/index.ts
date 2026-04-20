require('dotenv').config();
const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to SQLite database via Prisma');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }
}

main();
