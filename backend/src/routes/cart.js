const express = require("express");
const { z } = require("zod");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const addCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
});

const updateCartSchema = z.object({
  quantity: z.number().int().min(1),
});

const addPrice = (p) => ({
  ...p,
  finalPrice: Math.round(p.price * (1 - p.discount / 100)),
});

// GET /api/cart - Get user's cart items
router.get("/", requireAuth, async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
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

    const subtotal = formattedItems.reduce(
      (sum, item) => sum + item.product.finalPrice * item.quantity,
      0
    );

    res.json({ items: formattedItems, subtotal });
  } catch (err) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ error: "Could not load cart items" });
  }
});

// POST /api/cart - Add or update product in cart
router.post("/", requireAuth, async (req, res) => {
  const parsed = addCartSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { productId, quantity } = parsed.data;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < 1) {
      return res.status(400).json({ error: "Product is out of stock" });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    let cartItem;
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({
          error: `Only ${product.stock} units available in stock`,
        });
      }
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { product: true },
      });
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({
          error: `Only ${product.stock} units available in stock`,
        });
      }
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity,
        },
        include: { product: true },
      });
    }

    res.status(200).json({ message: "Cart updated", item: cartItem });
  } catch (err) {
    console.error("Add cart error:", err);
    res.status(500).json({ error: "Could not add item to cart" });
  }
});

// PUT /api/cart/:id - Update cart item quantity
router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateCartSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { quantity } = parsed.data;

  try {
    const existing = await prisma.cartItem.findFirst({
      where: { id, userId: req.user.id },
      include: { product: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    if (quantity > existing.product.stock) {
      return res.status(400).json({
        error: `Only ${existing.product.stock} units available in stock`,
      });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    });

    res.json({ message: "Quantity updated", item: updated });
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ error: "Could not update cart item" });
  }
});

// DELETE /api/cart/:id - Remove item from cart
router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const existing = await prisma.cartItem.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await prisma.cartItem.delete({ where: { id } });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Delete cart error:", err);
    res.status(500).json({ error: "Could not remove item from cart" });
  }
});

module.exports = router;
