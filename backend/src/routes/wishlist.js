const express = require("express");
const { z } = require("zod");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const wishlistSchema = z.object({
  productId: z.number().int().positive(),
});

const addPrice = (p) => ({
  ...p,
  finalPrice: Math.round(p.price * (1 - p.discount / 100)),
});

// GET /api/wishlist - Get user's wishlist
router.get("/", requireAuth, async (req, res) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: { category: { select: { name: true } } },
        },
      },
      orderBy: { id: "desc" },
    });

    const formattedItems = items.map((item) => ({
      ...item,
      product: addPrice(item.product),
    }));

    res.json({ wishlist: formattedItems });
  } catch (err) {
    console.error("Fetch wishlist error:", err);
    res.status(500).json({ error: "Could not load wishlist" });
  }
});

// POST /api/wishlist - Add product to wishlist
router.post("/", requireAuth, async (req, res) => {
  const parsed = wishlistSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { productId } = parsed.data;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    if (existing) {
      return res.status(200).json({ message: "Product is already in wishlist", item: existing });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        userId: req.user.id,
        productId,
      },
      include: { product: true },
    });

    res.status(201).json({ message: "Added to wishlist", item });
  } catch (err) {
    console.error("Add wishlist error:", err);
    res.status(500).json({ error: "Could not add to wishlist" });
  }
});

// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete("/:productId", requireAuth, async (req, res) => {
  const productId = Number(req.params.productId);

  try {
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    if (!existing) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }

    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("Delete wishlist error:", err);
    res.status(500).json({ error: "Could not remove from wishlist" });
  }
});

module.exports = router;
