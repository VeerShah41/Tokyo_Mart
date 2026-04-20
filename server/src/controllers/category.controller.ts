const prisma = require('../lib/prisma');

// ─── GET /api/categories ──────────────────────────────────────────────────────
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── GET /api/categories/:id ──────────────────────────────────────────────────
const getCategoryById = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(req.params.id) },
      include: { products: true },
    });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── POST /api/categories (admin) ────────────────────────────────────────────
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required.' });

    const category = await prisma.category.create({ data: { name } });
    res.status(201).json({ message: 'Category created.', category });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Category name already exists.' });
    }
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── PUT /api/categories/:id (admin) ─────────────────────────────────────────
const updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required.' });

    const category = await prisma.category.update({ where: { id }, data: { name } });
    res.json({ message: 'Category updated.', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── DELETE /api/categories/:id (admin) ──────────────────────────────────────
const deleteCategory = async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
