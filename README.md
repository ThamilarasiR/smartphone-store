# ⚡ INFYPHONES - Smartphone E-Commerce Store (INFYHACKATHON 2.0)

A complete, production-grade e-commerce application built for the **Smartphones** niche, covering the full customer shopping journey, simulated checkout, admin management panel, and **INFY AI** shopping assistant.

---

## 🌟 Features & Highlights

### 📱 Customer Application
1. **Product Discovery & Search**:
   - Home page with hero highlights, category shortcuts, trending smartphones, and gaming/flagship sections.
   - Category and Subcategory tree navigation (Budget, Mid-range, Flagship, Gaming, Camera Phones).
   - Real-time search by brand, model name, chipset, or camera keyword.
   - Dynamic sidebar filters for Brand, RAM size (4GB+, 6GB+, 8GB+, 12GB+), Price range, and 5G/4G connectivity.
   - Sorting options (Newest, Price Low-High, Price High-Low, Discount %).
2. **Product Details & Verified Hardware Specs**:
   - Multi-image interactive gallery viewer.
   - Full technical specifications table aligned with **GSMArena** standards.
   - Real-time stock status pills (*In Stock*, *Low Stock < 5*, *Out of Stock*).
   - Customer ratings & review submission system.
3. **Shopping Experience**:
   - Save items to Wishlist with instant heart toggles.
   - Add to Cart with quantity controls and stock limits.
   - Cart subtotal summary with discount savings calculation.
   - Step-by-step simulated checkout (Address → Payment Method [Card / UPI / COD] → Confirmation).
   - Order history tracking with visual delivery status timeline (*Pending → Confirmed → Processing → Shipped → Delivered*).

---

### 🛡️ Admin Panel
- **Overview Dashboard**: Metrics for Total Products, Registered Users, Total Orders, Total Revenue, and Low-Stock Alert Box (`stock < 5`).
- **Product Management**: Add new smartphones with spec inputs & image URLs, Edit existing products, Delete products.
- **Order Management**: View all customer orders and update status flow (*Pending → Confirmed → Processing → Shipped → Delivered*).
- **User Management**: View registered customers, roles, and order counts.
- **Security & Route Protection**: Admin routes protected by `requireAuth` + `requireAdmin` middleware on the backend and hidden in the UI for regular users.

---

### ✨ INFY AI Shopping Assistant ("Useful AI")
- Accesses **live database records** directly to answer queries accurately without inventing non-existent devices.
- **Capabilities**:
  - *Product Recommendations*: Query phones by budget, RAM, camera, or gaming requirements (e.g., `"Phones under ₹30,000 with a good camera"`).
  - *Side-by-Side Comparison*: Detailed spec table and explanation of differences (e.g., compare chipset, camera, battery, and RAM).
  - *Price Insights*: Explains why flagship models cost more based on real hardware data.
  - *Use-case advice*: Recommends devices suitable for college students or mobile gaming.

---

## 🛠️ Technology Stack

- **Frontend**: React + Vite, Tailwind CSS v4, React Router DOM v7, Axios.
- **Backend**: Node.js + Express.js.
- **Database & ORM**: PostgreSQL on Supabase + Prisma 6.
- **Authentication**: JWT stored in `httpOnly` secure cookies + bcrypt password hashing.
- **Input Validation**: Zod schema validation on backend APIs.
- **AI Integration**: Custom database-backed intelligent assistant query engine.

---

## 🗄️ Database Architecture & Schema

The database uses PostgreSQL with 8 relational models:
1. `User`: User profiles (`CUSTOMER` / `ADMIN` roles, bcrypt password hash, phone).
2. `Category`: Hierarchical category structure via self-referencing `parentId` (Subcategories).
3. `Product`: Smartphone models with spec columns (`ram`, `storage`, `processor`, `screen`, `battery`, `rearCamera`, `frontCamera`, `os`, `network`, `price`, `discount`, `stock`, `images`).
4. `Review`: Ratings (1-5) and customer feedback comments linked to user & product.
5. `WishlistItem`: Saved products per user (`userId`, `productId`).
6. `CartItem`: Items in active shopping cart with quantity checks (`userId`, `productId`, `quantity`).
7. `Order`: Placed orders with full shipping address, payment method, and status enum (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`).
8. `OrderItem`: Price snapshot at order time to preserve historic transaction records even if product prices change later.

---

## 🔐 Key Engineering & Security Decisions

1. **Prisma Transaction Stock Deduction**:
   - Order creation runs inside a `prisma.$transaction()`.
   - Re-checks stock levels inside the transaction. If stock is insufficient, the transaction rolls back cleanly with a user error message.
   - Prevents overselling and race conditions.
2. **Duplicate Action Prevention**:
   - The place-order button is disabled immediately upon clicking to prevent duplicate payments or orders.
3. **Admin Route Security**:
   - Protected by `requireAuth` and `requireAdmin` middleware on Express API routes.
   - Role-based routing in React UI hides admin features from regular customers.
4. **Environment Secrets Protection**:
   - No hardcoded database credentials or JWT secrets in code. Environment variables loaded securely from `.env`.

---

## 🚀 Step-by-Step Setup & Running Instructions

### 1️⃣ Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Push Prisma schema to Supabase/PostgreSQL database
npx prisma db push

# Seed 30 realistic smartphones, categories & demo users
node prisma/seed.js

# Start backend server
node src/server.js
```
*Backend will run on `http://localhost:5000`.*

---

### 2️⃣ Frontend Setup

```powershell
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend will run on `http://localhost:5173`.*

---

## 🔑 Demo Login Credentials for Hackathon Judges

| Role | Email | Password | Access |
|---|---|---|---|
| **Customer User** | `user@store.com` | `User@123` | Shopping, Wishlist, Cart, Checkout, Order History, Reviews |
| **Admin User** | `admin@store.com` | `Admin@123` | Dashboard Analytics, Product CRUD, Stock Updates, Order Status, User View |

*(Quick-fill demo buttons are provided on the Login page for instant 1-click access during judging).*

---

## 📄 License & Credits
Built for **INFYHACKATHON 2.0** by Infynux Academy.