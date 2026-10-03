const express = require("express");
const { z } = require("zod");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const querySchema = z.object({
  search: z.string().trim().max(100).optional(),
  brand: z.string().trim().optional(),
  category: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  ram: z.coerce.number().int().positive().optional(),
  network: z.enum(["4G", "5G"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "discount"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3, "Comment must be at least 3 characters").max(500),
});

const sortMap = {
  newest: { createdAt: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  discount: { discount: "desc" },
};

const addPrice = (p) => ({
  ...p,
  finalPrice: Math.round(p.price * (1 - p.discount / 100)),
});

router.get("/meta/filters", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true },
      orderBy: { id: "asc" },
    });
    const rows = await prisma.product.findMany({
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    });
    res.json({ categories, brands: rows.map((b) => b.brand) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load filters" });
  }
});

router.get("/", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const q = parsed.data;

  const where = {};
  if (q.search) {
    where.OR = [
      { name: { contains: q.search, mode: "insensitive" } },
      { brand: { contains: q.search, mode: "insensitive" } },
      { processor: { contains: q.search, mode: "insensitive" } },
      { description: { contains: q.search, mode: "insensitive" } },
    ];
  }
  if (q.brand) where.brand = { equals: q.brand, mode: "insensitive" };

  if (q.category) {
    // Check if category has children subcategories
    const catWithSubs = await prisma.category.findUnique({
      where: { id: q.category },
      include: { children: true },
    });
    if (catWithSubs && catWithSubs.children.length > 0) {
      const childIds = catWithSubs.children.map((c) => c.id);
      where.categoryId = { in: [q.category, ...childIds] };
    } else {
      where.categoryId = q.category;
    }
  }

  if (q.ram) where.ram = { gte: q.ram };
  if (q.network) where.network = q.network;
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    where.price = {};
    if (q.minPrice !== undefined) where.price.gte = q.minPrice;
    if (q.maxPrice !== undefined) where.price.lte = q.maxPrice;
  }

  try {
    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      orderBy: sortMap[q.sort],
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: { category: { select: { id: true, name: true, parentId: true } } },
    });
    res.json({
      products: products.map(addPrice),
      total,
      page: q.page,
      totalPages: Math.ceil(total / q.limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load products" });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid product id" });
  }
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, parentId: true } },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const count = product.reviews.length;
    const avgRating = count
      ? Number((product.reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
      : 0;
    res.json({ product: { ...addPrice(product), avgRating, reviewCount: count } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load product" });
  }
});

// Add Review (Authenticated Customers)
router.post("/:id/reviews", requireAuth, async (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const review = await prisma.review.create({
      data: {
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        userId: req.user.id,
        productId,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    res.status(201).json({ review });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

module.exports = router;
