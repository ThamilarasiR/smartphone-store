import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCartWishlist } from "../context/CartWishlistContext";

export default function Navbar({ onOpenAi }) {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount, wishlistCount } = useCartWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-wider group">
            <span className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center text-white text-lg font-black shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              ⚡
            </span>
            <span className="text-slate-100">INFY<span className="gradient-text">PHONES</span></span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search smartphones by brand, spec, camera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-400 text-sm rounded-full pl-10 pr-10 py-2 border border-slate-700/60 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </form>

          {/* Navigation Links & Action Buttons */}
          <div className="flex items-center gap-3">
            
            {/* INFY AI Assistant Trigger Button */}
            <button
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 hover:from-indigo-500/30 hover:to-pink-500/30 text-indigo-300 border border-indigo-500/40 shadow-sm transition-all hover:scale-105"
            >
              <span className="animate-pulse">✨</span>
              <span>INFY AI</span>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Wishlist"
            >
              <span className="text-lg">❤️</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Cart"
            >
              <span className="text-lg">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Admin Badge & Link if Admin */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium hover:bg-amber-500/30"
              >
                <span>🛡️</span> Admin Panel
              </Link>
            )}

            {/* User Auth Profile Dropdown / Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/orders"
                  className="hidden sm:block text-xs font-medium text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60"
                >
                  My Orders
                </Link>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/70 rounded-full px-3 py-1">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-200 hidden lg:inline max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <button
                    onClick={logout}
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors ml-1"
                    title="Logout"
                  >
                    🚪
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/80 hover:bg-slate-800/60 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-medium text-white px-3.5 py-1.5 rounded-lg gradient-btn shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-slate-300 hover:text-white p-2"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation & Search Drawer */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search smartphones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 placeholder-slate-400 text-sm rounded-lg pl-9 pr-4 py-2 border border-slate-700 focus:outline-none"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
            </form>
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-300">
              <Link to="/products" onClick={() => setMenuOpen(false)} className="hover:text-white">
                📱 All Smartphones
              </Link>
              {user && (
                <>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="hover:text-white">
                    📦 My Orders
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className="text-amber-400 hover:text-amber-300">
                  🛡️ Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
