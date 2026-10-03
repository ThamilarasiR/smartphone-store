const express = require("express");
const prisma = require("../db");

const router = express.Router();

const addPrice = (p) => ({
  ...p,
  finalPrice: Math.round(p.price * (1 - p.discount / 100)),
});

// Helper for formatting pricing in INR
const formatRupee = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

// Database Query Tool: Search Products based on exact attributes
async function searchProductsInDb(filters) {
  const where = {};

  if (filters.maxPrice) where.price = { lte: Number(filters.maxPrice) };
  if (filters.minPrice) where.price = { ...where.price, gte: Number(filters.minPrice) };
  if (filters.brand) where.brand = { equals: filters.brand, mode: "insensitive" };
  if (filters.minRam) where.ram = { gte: Number(filters.minRam) };
  if (filters.network) where.network = filters.network;

  if (filters.category) {
    where.category = {
      name: { contains: filters.category, mode: "insensitive" }
    };
  }

  if (filters.keyword) {
    where.OR = [
      { name: { contains: filters.keyword, mode: "insensitive" } },
      { description: { contains: filters.keyword, mode: "insensitive" } },
      { processor: { contains: filters.keyword, mode: "insensitive" } },
      { rearCamera: { contains: filters.keyword, mode: "insensitive" } }
    ];
  }

  const products = await prisma.product.findMany({
    where,
    take: 6,
    orderBy: { price: "desc" },
    include: { category: { select: { name: true } } }
  });

  return products.map(addPrice);
}

// Compare two or more products by IDs or names
async function compareProductsInDb(productIds) {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: { select: { name: true } } }
  });

  return products.map(addPrice);
}

// POST /api/ai/chat - INFY AI assistant
router.post("/chat", async (req, res) => {
  const { message, compareIds } = req.body;
  if (!message && (!compareIds || compareIds.length === 0)) {
    return res.status(400).json({ error: "Please enter a message or select products to compare." });
  }

  try {
    const text = (message || "").toLowerCase();

    // 1. DIRECT COMPARISON REQUEST WITH IDs
    if (compareIds && compareIds.length >= 2) {
      const items = await compareProductsInDb(compareIds);
      if (items.length < 2) {
        return res.json({
          reply: "Could not find the requested products for comparison.",
          comparison: null,
          products: []
        });
      }

      const p1 = items[0];
      const p2 = items[1];

      const priceDiff = Math.abs(p1.finalPrice - p2.finalPrice);
      const higher = p1.finalPrice > p2.finalPrice ? p1 : p2;
      const lower = p1.finalPrice > p2.finalPrice ? p2 : p1;

      let reasoning = `Comparing **${p1.name}** vs **${p2.name}**:\n\n`;
      reasoning += `• **Price Difference**: ${higher.name} costs ${formatRupee(priceDiff)} more than ${lower.name}.\n`;
      reasoning += `• **Performance**: ${p1.name} comes with ${p1.processor} (${p1.ram}GB RAM) while ${p2.name} has ${p2.processor} (${p2.ram}GB RAM).\n`;
      reasoning += `• **Camera Setup**: ${p1.name} features ${p1.rearCamera} vs ${p2.name}'s ${p2.rearCamera}.\n`;
      reasoning += `• **Battery**: ${p1.name} offers ${p1.battery}mAh battery compared to ${p2.battery}mAh in ${p2.name}.\n\n`;
      reasoning += `💡 **Recommendation**: If your priority is maximum camera resolution and performance, **${higher.name}** justifies the higher price. Otherwise, **${lower.name}** offers superior value for money.`;

      return res.json({
        reply: reasoning,
        type: "comparison",
        products: items,
      });
    }

    // 2. PARSE INTENT FROM QUERY
    const filters = {};

    // Price extraction: e.g. "under 30000", "under 30k", "below 50000"
    const priceMatch = text.match(/(?:under|below|less than|budget|around|max)\s*(?:rs\.?|₹)?\s*(\d+)\s*(k|thousand)?/i);
    if (priceMatch) {
      let val = parseInt(priceMatch[1], 10);
      if (priceMatch[2] && priceMatch[2].toLowerCase() === "k") val *= 1000;
      else if (val < 200) val *= 1000; // e.g. "under 30k" or "under 30" -> 30000
      filters.maxPrice = val;
    }

    // RAM extraction: e.g. "8gb ram", "12gb"
    const ramMatch = text.match(/(\d+)\s*gb/i);
    if (ramMatch) {
      filters.minRam = parseInt(ramMatch[1], 10);
    }

    // Brand extraction
    const brands = ["samsung", "apple", "iphone", "oneplus", "redmi", "realme", "vivo", "iqoo", "poco", "motorola", "google"];
    for (const b of brands) {
      if (text.includes(b)) {
        filters.brand = b === "iphone" ? "apple" : b;
        break;
      }
    }

    // Keywords (camera, gaming, battery, student, budget)
    if (text.includes("camera") || text.includes("photo") || text.includes("portrait")) {
      filters.keyword = "camera";
      filters.category = "Camera";
    } else if (text.includes("gaming") || text.includes("game") || text.includes("fps") || text.includes("bgmi")) {
      filters.keyword = "gaming";
      filters.category = "Gaming";
    } else if (text.includes("student") || text.includes("college") || text.includes("value")) {
      filters.category = "Budget";
    }

    // Fetch matched products from Database
    const matchedProducts = await searchProductsInDb(filters);

    if (matchedProducts.length === 0) {
      // Fallback query if overly constrained
      const fallbackProducts = await prisma.product.findMany({
        take: 4,
        orderBy: { price: "asc" }
      });
      return res.json({
        reply: `I searched our inventory but couldn't find exact matches for those criteria. Here are our top value smartphones currently available:`,
        type: "recommendation",
        products: fallbackProducts.map(addPrice)
      });
    }

    // Build intelligent context-aware response based on matched product data
    let reply = `Based on your request, I analyzed our live smartphone inventory. Here are the best recommendations:\n\n`;

    matchedProducts.forEach((p, idx) => {
      reply += `**${idx + 1}. ${p.name} (${p.brand})** - ${formatRupee(p.finalPrice)}\n`;
      reply += `• Key specs: ${p.ram}GB RAM / ${p.storage}GB Storage, ${p.processor} processor, ${p.rearCamera} rear camera, ${p.battery}mAh battery.\n`;
      reply += `• Why pick it: ${p.description}\n\n`;
    });

    if (matchedProducts.length >= 2 && text.includes("why")) {
      const p1 = matchedProducts[0];
      const p2 = matchedProducts[1];
      const diff = Math.abs(p1.finalPrice - p2.finalPrice);
      reply += `💡 **Price Insight**: **${p1.name}** costs ${formatRupee(diff)} more mainly due to its higher processor performance (${p1.processor}) and camera setup (${p1.rearCamera}).`;
    }

    res.json({
      reply,
      type: "recommendation",
      products: matchedProducts,
    });
  } catch (err) {
    console.error("INFY AI error:", err);
    res.status(500).json({ error: "Failed to process AI shopping request" });
  }
});

module.exports = router;
