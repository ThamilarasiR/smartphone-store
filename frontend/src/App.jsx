import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartWishlistProvider } from "./context/CartWishlistContext";

import Navbar from "./components/Navbar";
import CategoryNav from "./components/CategoryNav";
import Footer from "./components/Footer";
import InfyAiModal from "./components/InfyAiModal";

import HomePage from "./pages/HomePage";
import ProductListingPage from "./pages/ProductListingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminUsersPage from "./pages/AdminUsersPage";

export default function App() {
  const [aiOpen, setAiOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <AuthProvider>
      <CartWishlistProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
            
            {/* Global Navbar */}
            <Navbar onOpenAi={() => setAiOpen(true)} />
            
            {/* Category Pill Sub-bar */}
            <CategoryNav />

            {/* Global Floating Toast Alert */}
            {toastMessage && (
              <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-indigo-400 flex items-center gap-2 animate-bounce">
                <span>⚡</span>
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Main Application Body */}
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage onShowToast={showToast} onOpenAi={() => setAiOpen(true)} />} />
                <Route path="/products" element={<ProductListingPage onShowToast={showToast} />} />
                <Route path="/product/:id" element={<ProductDetailPage onShowToast={showToast} onOpenAi={() => setAiOpen(true)} />} />
                <Route path="/cart" element={<CartPage onShowToast={showToast} />} />
                <Route path="/wishlist" element={<WishlistPage onShowToast={showToast} />} />
                <Route path="/checkout" element={<CheckoutPage onShowToast={showToast} />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/login" element={<LoginPage onShowToast={showToast} />} />
                <Route path="/register" element={<RegisterPage onShowToast={showToast} />} />

                {/* Protected Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/products" element={<AdminProductsPage onShowToast={showToast} />} />
                <Route path="/admin/orders" element={<AdminOrdersPage onShowToast={showToast} />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Routes>
            </div>

            {/* Footer */}
            <Footer />

            {/* INFY AI Shopping Assistant Modal Widget */}
            <InfyAiModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />

          </div>
        </Router>
      </CartWishlistProvider>
    </AuthProvider>
  );
}