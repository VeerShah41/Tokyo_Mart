const prisma = require('./prisma');

// ─── Safe JSON Parse ──────────────────────────────────────────────────────────
function safeParseJSON(str) {
  if (Array.isArray(str)) return str;
  try {
    return JSON.parse(str);
  } catch {
    // fallback: comma-separated string
    return str ? str.split(',').map((s) => s.trim()) : [];
  }
}

// ─── Format Product for API Response ─────────────────────────────────────────
function formatProduct(p, reason = '') {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    brand: p.brand,
    price: p.price,
    currency: p.currency || 'INR',
    imageUrl: p.imageUrl,
    description: p.description,
    colors: safeParseJSON(p.colors),
    sizes: safeParseJSON(p.sizes),
    tags: safeParseJSON(p.tags),
    stock: p.stock,
    featured: p.featured,
    reason,
  };
}

// ─── Search Products ──────────────────────────────────────────────────────────
/**
 * Filter products from SQLite using Prisma.
 * Returns at most 3 results, sorted by budget proximity if maxPrice given.
 */
async function searchProducts(filters: any = {}) {
  const { category, brand, color, maxPrice, minPrice, size, tags, featured } = filters;

  const where: any = {
    stock: { gt: 0 }, // only in-stock
  };

  if (category) {
    where.category = { contains: category };
  }
  if (brand) {
    where.brand = { contains: brand };
  }
  if (maxPrice != null) {
    where.price = { ...where.price, lte: Number(maxPrice) };
  }
  if (minPrice != null) {
    where.price = { ...where.price, gte: Number(minPrice) };
  }
  if (featured === true) {
    where.featured = true;
  }

  let products = await prisma.product.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { price: 'asc' }],
    take: 20, // get more, then post-filter
  });

  // Post-filter: colors (stored as JSON string)
  if (color) {
    const colorLower = color.toLowerCase();
    products = products.filter((p) => {
      const colors = safeParseJSON(p.colors);
      return colors.some((c) => c.toLowerCase().includes(colorLower));
    });
  }

  // Post-filter: sizes
  if (size) {
    products = products.filter((p) => {
      const sizes = safeParseJSON(p.sizes);
      return sizes.some((s) => s.toLowerCase() === size.toLowerCase());
    });
  }

  // Post-filter: tags
  if (tags && tags.length > 0) {
    products = products.filter((p) => {
      const pTags = safeParseJSON(p.tags);
      return tags.some((t) =>
        pTags.some((pt) => pt.toLowerCase().includes(t.toLowerCase()))
      );
    });
  }

  // Sort: if budget given, prefer items closest to but under budget
  if (maxPrice != null) {
    products.sort(
      (a, b) => Math.abs(b.price - maxPrice) - Math.abs(a.price - maxPrice)
    );
    // Reverse so closest match comes first
    products.sort(
      (a, b) => Math.abs(a.price - maxPrice) - Math.abs(b.price - maxPrice)
    );
  }

  // Return top 3
  return products.slice(0, 3).map((p) =>
    formatProduct(
      p,
      `Matches: ${[category, color, ...(tags || [])].filter(Boolean).join(', ')}`
    )
  );
}

module.exports = { searchProducts, formatProduct, safeParseJSON };
