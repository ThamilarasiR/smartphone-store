import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCartWishlist } from "../context/CartWishlistContext";

export default function ProductCard({ product, onShowToast }) {
  const { addToCart, toggleWishlist, isItemWishlisted } = useCartWishlist();
  const [adding, setAdding] = useState(false);
  const wishlisted = isItemWishlisted(product.id);

  const handleCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock < 1) return;

    try {
      setAdding(true);
      await addToCart(product.id, 1);
      if (onShowToast) onShowToast(`Added ${product.name} to cart!`);
    } catch (err) {
      if (onShowToast) onShowToast(err.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(product.id);
      if (onShowToast) {
        onShowToast(wishlisted ? "Removed from wishlist" : "Added to wishlist!");
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.message || "Please login first");
    }
  };

  const isLowStock = product.stock > 0 && product.stock < 5;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group relative">
      
      {/* Top Image & Wishlist Button */}
      <div className="relative aspect-square bg-slate-900/80 overflow-hidden flex items-center justify-center p-4">
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500/90 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wider z-10 shadow-sm">
            {product.discount}% OFF
          </span>
        )}

        {/* Low Stock / Out of Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-12 bg-slate-800 text-slate-300 font-medium text-[10px] px-2 py-0.5 rounded-full z-10">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute top-3 right-12 bg-amber-500/90 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full z-10 animate-pulse">
            Only {product.stock} left
          </span>
        ) : null}

        {/* Wishlist Heart Toggle */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 z-10 ${
            wishlisted
              ? "bg-pink-500/20 text-pink-500 border border-pink-500/40"
              : "bg-slate-950/40 text-slate-400 border border-slate-700/50 hover:text-white"
          }`}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlisted ? "❤️" : "🤍"}
        </button>

        {/* Product Image */}
        <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
          <img
            src={product.images?.[0] || "https://placehold.co/600x600/png?text=Smartphone"}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-semibold uppercase text-indigo-400 tracking-wider">
              {product.brand}
            </span>
            <span>{product.network || "5G"}</span>
          </div>

          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-bold text-slate-100 text-sm hover:text-indigo-300 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Quick Specs Pill Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
              {product.ram}GB RAM
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
              {product.storage}GB
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 truncate max-w-[120px]">
              {product.processor}
            </span>
          </div>
        </div>

        {/* Pricing and Cart Action Button */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-extrabold text-white">
              ₹{(product.finalPrice || product.price).toLocaleString("en-IN")}
            </div>
            {product.discount > 0 && (
              <div className="text-[11px] text-slate-500 line-through">
                ₹{product.price.toLocaleString("en-IN")}
              </div>
            )}
          </div>

          <button
            onClick={handleCartClick}
            disabled={isOutOfStock || adding}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isOutOfStock
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "gradient-btn text-white shadow-sm active:scale-95"
            }`}
          >
            <span>🛒</span>
            <span>{adding ? "..." : isOutOfStock ? "Sold Out" : "Add"}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
