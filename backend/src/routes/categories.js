const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET /api/categories - get main categories and their subcategories
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // top-level categories
      include: {
        children: {
          select: { id: true, name: true }
        }
      },
      orderBy: { id: "asc" }
    });
    res.json({ categories });
  } catch (err) {
    console.error("Categories fetch error:", err);
    res.status(500).json({ error: "Could not load categories" });
  }
});

module.exports = router;
