const prisma = require('../lib/prisma');

const normalizeCategory = (value) => decodeURIComponent(String(value || '')).trim();

const getAllCategories = async (_req, res) => {
  try {
    const rows = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    res.json(rows.filter((row) => row.category).map((row) => ({ name: row.category })));
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = normalizeCategory(req.params.id);
    const products = await prisma.product.findMany({
      where: { category },
      orderBy: { name: 'asc' },
    });

    if (!products.length) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.json({ name: category, products });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const createCategory = async (req, res) => {
  const name = normalizeCategory(req.body?.name);

  if (!name) {
    return res.status(400).json({ message: 'name is required.' });
  }

  return res.status(200).json({
    message: 'Categories are derived from product data. Create a product with this category to make it available.',
    category: { name },
  });
};

const updateCategory = async (req, res) => {
  try {
    const currentName = normalizeCategory(req.params.id);
    const nextName = normalizeCategory(req.body?.name);

    if (!currentName || !nextName) {
      return res.status(400).json({ message: 'Current category and new name are required.' });
    }

    const result = await prisma.product.updateMany({
      where: { category: currentName },
      data: { category: nextName },
    });

    if (!result.count) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.json({ message: 'Category updated.', category: { name: nextName, updatedProducts: result.count } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  const category = normalizeCategory(req.params.id);

  if (!category) {
    return res.status(400).json({ message: 'Category is required.' });
  }

  return res.status(400).json({
    message: 'Categories are derived from products. Delete or reassign products in this category instead.',
  });
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
