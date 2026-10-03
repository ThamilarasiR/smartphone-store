const express = require("express");
const { z } = require("zod");
const prisma = require("../db");

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
      select: { id: true, name: true },
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
    ];
  }
  if (q.brand) where.brand = { equals: q.brand, mode: "insensitive" };
  if (q.category) where.categoryId = q.category;
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
      include: { category: { select: { id: true, name: true } } },
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
        category: { select: { id: true, name: true } },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { name: true } },
          },
        },
      },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const count = product.reviews.length;
    const avgRating = count
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / count
      : null;
    res.json({ product: { ...addPrice(product), avgRating, reviewCount: count } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load product" });
  }
});

module.exports = router;
