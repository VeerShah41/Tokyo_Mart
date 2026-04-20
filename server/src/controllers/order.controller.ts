const prisma = require('../lib/prisma');

// ─── GET /api/orders (customer: own orders | admin: all orders) ───────────────
const getOrders = async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? {} : { userId: req.user.id };

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { orderItems: { include: { product: true } }, user: true },
    });

    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── POST /api/orders (place order from cart provided in request body) ────────
const placeOrder = async (req, res) => {
  try {
    const { cartItems } = req.body; // Expecting [{ productId, quantity, price, size }]

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Fetch products to validate stock and calculate total securely
    const productIds = cartItems.map(item => Number(item.productId));
    const productsInDb = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const productsMap = productsInDb.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    let totalAmount = 0;

    // Validate stock and build order items
    const orderItemsToCreate = [];
    for (const item of cartItems) {
      const pId = Number(item.productId);
      const product = productsMap[pId];

      if (!product) {
        return res.status(404).json({ message: `Product ID ${pId} not found.` });
      }
      
      const qty = Number(item.quantity);
      if (product.stock < qty) {
        return res.status(400).json({ message: `Insufficient stock for "${product.name}".` });
      }

      totalAmount += product.price * qty;
      
      orderItemsToCreate.push({
        productId: product.id,
        quantity: qty,
        price: product.price,
        size: item.size || 'one-size'
      });
    }

    // Transaction: create order, deduct stock
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          orderItems: {
            create: orderItemsToCreate,
          },
        },
        include: { orderItems: { include: { product: true } } },
      });

      // Deduct stock
      for (const item of orderItemsToCreate) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    res.status(201).json({ message: 'Order placed successfully.', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ─── PUT /api/orders/:id/status (admin) ───────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });

    res.json({ message: 'Order status updated.', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { getOrders, getOrderById, placeOrder, updateOrderStatus };
