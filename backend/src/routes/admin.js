const express = require("express");
const { z } = require("zod");
const prisma = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Apply Auth + Admin protection middleware to all admin routes
router.use(requireAuth, requireAdmin);

// Zod Product Schema for Create / Update
const productSchema = z.object({
  name: z.string().trim().min(2, "Name required").max(100),
  brand: z.string().trim().min(1, "Brand required"),
  description: z.string().trim().min(5, "Description required"),
  price: z.number().int().min(1, "Price must be positive"),
  discount: z.number().int().min(0).max(100).default(0),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).min(1, "At least one image URL required"),
  ram: z.number().int().positive("RAM in GB required"),
  storage: z.number().int().positive("Storage in GB required"),
  processor: z.string().trim().min(1, "Processor required"),
  screen: z.number().positive("Screen size required"),
  battery: z.number().int().positive("Battery mAh required"),
  rearCamera: z.string().trim().min(1, "Rear camera spec required"),
  frontCamera: z.string().trim().optional(),
  os: z.string().trim().optional(),
  network: z.string().trim().optional(),
  weight: z.number().int().optional(),
  categoryId: z.number().int().positive("Category is required"),
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]),
});

// GET /api/admin/dashboard - Overview statistics
router.get("/dashboard", async (req, res) => {
  try {
    const totalProducts = await prisma.product.count();
    const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const totalOrders = await prisma.order.count();

    const revenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });
    const revenue = revenueResult._sum.totalAmount || 0;

    // Low stock items: stock < 5
    const lowStockCount = await prisma.product.count({
      where: { stock: { lt: 5 } },
    });

    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 5 } },
      select: { id: true, name: true, brand: true, stock: true, price: true },
      take: 10,
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    res.json({
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        revenue,
        lowStockCount,
      },
      lowStockProducts,
      recentOrders,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Could not load admin dashboard stats" });
  }
});

// GET /api/admin/products - List all products for management
router.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: { id: "desc" },
    });
    res.json({ products });
  } catch (err) {
    console.error("Admin list products error:", err);
    res.status(500).json({ error: "Could not load products" });
  }
});

// POST /api/admin/products - Create a new product
router.post("/products", async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const product = await prisma.product.create({
      data: parsed.data,
      include: { category: true },
    });
    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/admin/products/:id - Update existing product
router.put("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = productSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: { category: true },
    });

    res.json({ message: "Product updated successfully", product: updated });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    await prisma.product.delete({ where: { id } });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// GET /api/admin/orders - Get all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { name: true, brand: true, images: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
  } catch (err) {
    console.error("Admin orders error:", err);
    res.status(500).json({ error: "Could not load orders" });
  }
});

// PUT /api/admin/orders/:id/status - Update order status flow
router.put("/orders/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = statusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    res.json({ message: "Order status updated", order: updated });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// GET /api/admin/users - Get registered customers
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: "Could not load user list" });
  }
});

module.exports = router;
