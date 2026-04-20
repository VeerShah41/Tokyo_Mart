const prisma = require('../lib/prisma');

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getAllUsers, deleteUser };
