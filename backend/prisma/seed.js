// backend/prisma/seed.js
// Run from the backend folder:  node prisma/seed.js
// Specs are approximate sample data. Verify/edit before the final demo.

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const img = (text) =>
  `https://placehold.co/600x600/png?text=${encodeURIComponent(text)}`;

const phones = {
  Budget: [
    {
      name: "Redmi 13C 5G", brand: "Redmi", price: 10999, discount: 10, stock: 40,
      ram: 6, storage: 128, processor: "Dimensity 6100+", screen: 6.74, battery: 5000,
      rearCamera: "50MP + 2MP", frontCamera: "5MP", os: "Android 13", network: "5G", weight: 192,
      description: "Affordable 5G phone with a big display and all-day battery.",
    },
    {
      name: "Realme C63", brand: "Realme", price: 8999, discount: 8, stock: 35,
      ram: 4, storage: 128, processor: "Unisoc T612", screen: 6.74, battery: 5000,
      rearCamera: "50MP", frontCamera: "8MP", os: "Android 14", network: "4G", weight: 190,
      description: "Budget phone with a smooth display and good battery life.",
    },
    {
      name: "Samsung Galaxy M05", brand: "Samsung", price: 7999, discount: 5, stock: 50,
      ram: 4, storage: 64, processor: "Helio G85", screen: 6.7, battery: 5000,
      rearCamera: "50MP + 2MP", frontCamera: "8MP", os: "Android 14", network: "4G", weight: 188,
      description: "Simple, reliable phone for everyday calling and browsing.",
    },
    {
      name: "Lava Blaze 2 5G", brand: "Lava", price: 9499, discount: 12, stock: 25,
      ram: 4, storage: 128, processor: "Dimensity 6020", screen: 6.56, battery: 5000,
      rearCamera: "50MP", frontCamera: "8MP", os: "Android 13", network: "5G", weight: 190,
      description: "Clean Android experience with 5G at a low price.",
    },
  ],
  "Mid-range": [
    {
      name: "Redmi Note 13 Pro", brand: "Redmi", price: 23999, discount: 10, stock: 30,
      ram: 8, storage: 256, processor: "Snapdragon 7s Gen 2", screen: 6.67, battery: 5100,
      rearCamera: "200MP + 8MP + 2MP", frontCamera: "16MP", os: "Android 13", network: "5G", weight: 187,
      description: "High resolution camera and AMOLED display in the mid-range.",
    },
    {
      name: "Samsung Galaxy M35 5G", brand: "Samsung", price: 19999, discount: 15, stock: 28,
      ram: 8, storage: 128, processor: "Exynos 1380", screen: 6.6, battery: 6000,
      rearCamera: "50MP + 8MP + 2MP", frontCamera: "13MP", os: "Android 14", network: "5G", weight: 222,
      description: "Huge 6000 mAh battery with a bright Super AMOLED display.",
    },
    {
      name: "OnePlus Nord CE4", brand: "OnePlus", price: 24999, discount: 8, stock: 20,
      ram: 8, storage: 128, processor: "Snapdragon 7 Gen 3", screen: 6.7, battery: 5500,
      rearCamera: "50MP + 8MP", frontCamera: "16MP", os: "Android 14", network: "5G", weight: 186,
      description: "Fast charging and smooth performance for daily use.",
    },
    {
      name: "Realme Narzo 70 Pro", brand: "Realme", price: 18999, discount: 12, stock: 32,
      ram: 8, storage: 128, processor: "Dimensity 7050", screen: 6.67, battery: 5000,
      rearCamera: "50MP + 2MP", frontCamera: "16MP", os: "Android 14", network: "5G", weight: 189,
      description: "Stylish design with a good camera for the price.",
    },
    {
      name: "Vivo T3 5G", brand: "Vivo", price: 19499, discount: 10, stock: 26,
      ram: 8, storage: 128, processor: "Dimensity 7200", screen: 6.67, battery: 5000,
      rearCamera: "50MP + 2MP", frontCamera: "16MP", os: "Android 14", network: "5G", weight: 188,
      description: "AMOLED display and reliable performance.",
    },
  ],
  Gaming: [
    {
      name: "iQOO Z9 5G", brand: "iQOO", price: 19999, discount: 10, stock: 22,
      ram: 8, storage: 128, processor: "Dimensity 7200", screen: 6.67, battery: 5000,
      rearCamera: "50MP + 2MP", frontCamera: "16MP", os: "Android 14", network: "5G", weight: 185,
      description: "Smooth gaming performance at a mid-range price.",
    },
    {
      name: "Poco X6 Pro", brand: "Poco", price: 26999, discount: 12, stock: 18,
      ram: 12, storage: 256, processor: "Dimensity 8300 Ultra", screen: 6.67, battery: 5000,
      rearCamera: "64MP + 8MP + 2MP", frontCamera: "16MP", os: "Android 14", network: "5G", weight: 186,
      description: "Flagship-level chip for heavy gaming and multitasking.",
    },
  ],
  "Camera Phones": [
    {
      name: "Motorola Edge 50 Fusion", brand: "Motorola", price: 22999, discount: 10, stock: 20,
      ram: 8, storage: 128, processor: "Snapdragon 7s Gen 2", screen: 6.7, battery: 5000,
      rearCamera: "50MP + 13MP", frontCamera: "32MP", os: "Android 14", network: "5G", weight: 175,
      description: "Clean software and a strong camera setup.",
    },
    {
      name: "Google Pixel 8a", brand: "Google", price: 49999, discount: 5, stock: 10,
      ram: 8, storage: 128, processor: "Google Tensor G3", screen: 6.1, battery: 4492,
      rearCamera: "64MP + 13MP", frontCamera: "13MP", os: "Android 14", network: "5G", weight: 188,
      description: "Excellent photos with smart AI camera features.",
    },
  ],
  Flagship: [
    {
      name: "Samsung Galaxy S24", brand: "Samsung", price: 74999, discount: 10, stock: 12,
      ram: 8, storage: 256, processor: "Exynos 2400", screen: 6.2, battery: 4000,
      rearCamera: "50MP + 12MP + 10MP", frontCamera: "12MP", os: "Android 14", network: "5G", weight: 167,
      description: "Premium compact flagship with Galaxy AI features.",
    },
    {
      name: "iPhone 15", brand: "Apple", price: 69999, discount: 5, stock: 15,
      ram: 6, storage: 128, processor: "Apple A16 Bionic", screen: 6.1, battery: 3349,
      rearCamera: "48MP + 12MP", frontCamera: "12MP", os: "iOS 17", network: "5G", weight: 171,
      description: "Smooth performance and a great camera with Dynamic Island.",
    },
  ],
};

async function main() {
  console.log("Clearing old data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");
  const adminPass = await bcrypt.hash("Admin@123", 10);
  const userPass = await bcrypt.hash("User@123", 10);
  await prisma.user.create({
    data: { name: "Admin", email: "admin@store.com", password: adminPass, role: "ADMIN" },
  });
  await prisma.user.create({
    data: { name: "Test User", email: "user@store.com", password: userPass, role: "CUSTOMER" },
  });

  console.log("Creating categories and products...");
  let total = 0;
  for (const [categoryName, list] of Object.entries(phones)) {
    const category = await prisma.category.create({ data: { name: categoryName } });
    for (const p of list) {
      await prisma.product.create({
        data: { ...p, images: [img(p.name)], categoryId: category.id },
      });
      total++;
    }
  }

  console.log(`Done. Created ${total} products.`);
  console.log("Admin login: admin@store.com / Admin@123");
  console.log("User login:  user@store.com / User@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());