require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const products = require(path.resolve(__dirname, '..', '..', 'data', 'products.json'));

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Clean slate ──────────────────────────────────────────────────────────
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin user ───────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@tokyomart.com',
      password: adminPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ── Demo customer ────────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash('User@123', 12);
  await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'user@tokyomart.com',
      password: userPassword,
      role: 'customer',
    },
  });
  console.log('✅ Demo user created: user@tokyomart.com');

  // ── Products ─────────────────────────────────────────────────────────────
  for (const p of products) {
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        category: p.category,
        brand: p.brand,
        price: p.price,
        currency: p.currency || 'INR',
        colors: JSON.stringify(p.colors),
        sizes: JSON.stringify(p.sizes),
        stock: p.stock,
        imageUrl: p.imageUrl,
        description: p.description,
        tags: JSON.stringify(p.tags),
        featured: p.featured || false,
      },
    });
  }
  console.log(`✅ Seeded ${products.length} products`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
