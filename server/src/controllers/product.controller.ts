const prisma = require('../lib/prisma');
const { safeParseJSON } = require('../lib/product-search');

// ─── Helper: Format product ───────────────────────────────────────────────────
function fmt(p) {
  return {
    ...p,
    colors: safeParseJSON(p.colors),
    sizes: safeParseJSON(p.sizes),
    tags: safeParseJSON(p.tags),
  };
}

// ─── GET /api/products ────────────────────────────────────────────────────────
const getAllProducts = async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (category) where.category = { contains: category };
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ total, page: Number(page), limit: Number(limit), products: products.map(fmt) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── GET /api/products/categories ────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const rows = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    res.json({ categories: rows.map((r) => r.category) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── GET /api/products/:id ────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    // Support both numeric id and slug
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);
    const product = await prisma.product.findUnique({
      where: isNumeric ? { id: Number(id) } : { slug: id },
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(fmt(product));
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── POST /api/products ───────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { slug, name, category, brand, price, currency, colors, sizes, stock, imageUrl, description, tags, featured } = req.body;
    if (!slug || !name || !category || price == null) {
      return res.status(400).json({ message: 'slug, name, category, and price are required.' });
    }

    const product = await prisma.product.create({
      data: {
        slug,
        name,
        category,
        brand: brand || '',
        price: Number(price),
        currency: currency || 'INR',
        colors: Array.isArray(colors) ? JSON.stringify(colors) : (colors || '[]'),
        sizes: Array.isArray(sizes) ? JSON.stringify(sizes) : (sizes || '[]'),
        stock: Number(stock) || 0,
        imageUrl: imageUrl || '',
        description: description || '',
        tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]'),
        featured: Boolean(featured),
      },
    });

    res.status(201).json({ message: 'Product created.', product: fmt(product) });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'A product with this slug already exists.' });
    }
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── PUT /api/products/:id ────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Product not found.' });

    const { slug, name, category, brand, price, currency, colors, sizes, stock, imageUrl, description, tags, featured } = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(name && { name }),
        ...(category && { category }),
        ...(brand !== undefined && { brand }),
        ...(price != null && { price: Number(price) }),
        ...(currency && { currency }),
        ...(colors !== undefined && { colors: Array.isArray(colors) ? JSON.stringify(colors) : colors }),
        ...(sizes !== undefined && { sizes: Array.isArray(sizes) ? JSON.stringify(sizes) : sizes }),
        ...(stock != null && { stock: Number(stock) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? JSON.stringify(tags) : tags }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
      },
    });

    res.json({ message: 'Product updated.', product: fmt(updated) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Product not found.' });
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getAllProducts, getCategories, getProductById, createProduct, updateProduct, deleteProduct };
