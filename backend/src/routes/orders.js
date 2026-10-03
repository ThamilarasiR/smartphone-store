const express = require("express");
const { z } = require("zod");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const orderCreateSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100),
  phone: z.string().trim().min(10, "10-digit mobile number required").max(15),
  address: z.string().trim().min(5, "Detailed address required").max(300),
  city: z.string().trim().min(2, "City name required").max(100),
  pincode: z.string().trim().min(6, "Valid 6-digit Pincode required").max(10),
  paymentMethod: z.enum(["SIMULATED_CARD", "SIMULATED_UPI", "COD"]),
});

// Helper for price calculation
const getFinalPrice = (price, discount) => Math.round(price * (1 - discount / 100));

// POST /api/orders - Create order inside Prisma Transaction (Stock checks + reduction)
router.post("/", requireAuth, async (req, res) => {
  const parsed = orderCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { fullName, phone, address, city, pincode, paymentMethod } = parsed.data;

  try {
    // 1. Fetch user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Your cart is empty" });
    }

    // 2. Perform Order Creation within Prisma Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      // Validate stock for all cart items and build order items data
      for (const item of cartItems) {
        // Refetch product inside transaction for latest stock
        const freshProduct = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!freshProduct) {
          throw new Error(`Product "${item.product.name}" no longer exists.`);
        }

        if (freshProduct.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${freshProduct.name}". Only ${freshProduct.stock} unit(s) remaining.`
          );
        }

        const unitPrice = getFinalPrice(freshProduct.price, freshProduct.discount);
        totalAmount += unitPrice * item.quantity;

        // Deduct stock
        await tx.product.update({
          where: { id: freshProduct.id },
          data: { stock: freshProduct.stock - item.quantity },
        });

        orderItemsData.push({
          productId: freshProduct.id,
          quantity: item.quantity,
          price: unitPrice, // snapshot unit price at order time
        });
      }

      // Create Order record with OrderItems
      const createdOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          fullName,
          phone,
          address,
          city,
          pincode,
          paymentMethod,
          totalAmount,
          status: "CONFIRMED", // Simulated payment automatically succeeds
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // Clear user's cart items after successful order creation
      await tx.cartItem.deleteMany({
        where: { userId: req.user.id },
      });

      return createdOrder;
    });

    res.status(201).json({
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    // User-friendly error message for stock issues or failures
    res.status(400).json({ error: err.message || "Failed to place order" });
  }
});

// GET /api/orders - Get logged-in user's order history
router.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true, brand: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ orders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ error: "Could not load order history" });
  }
});

// GET /api/orders/:id - Get detailed order info by ID
router.get("/:id", requireAuth, async (req, res) => {
  const orderId = Number(req.params.id);

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                images: true,
                ram: true,
                storage: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ order });
  } catch (err) {
    console.error("Fetch order details error:", err);
    res.status(500).json({ error: "Could not load order details" });
  }
});

module.exports = router;
