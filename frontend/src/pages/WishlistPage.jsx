import React from "react";
import { Link } from "react-router-dom";
import { useCartWishlist } from "../context/CartWishlistContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";

export default function WishlistPage({ onShowToast }) {
  const { wishlistItems } = useCartWishlist();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-4xl">❤️🔒</div>
        <h2 className="text-xl font-bold text-white">Please Login to View Wishlist</h2>
        <p className="text-xs text-slate-400">Save your favorite smartphones and access them anytime.</p>
        <Link to="/login" className="inline-block px-6 py-2.5 rounded-xl font-bold text-xs text-white gradient-btn">
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>❤️</span> Saved Wishlist ({wishlistItems.length})
        </h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <div className="text-5xl">💔</div>
          <h2 className="text-lg font-bold text-white">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-400">Click the heart icon on any smartphone to save it for later.</p>
          <Link to="/products" className="inline-block px-6 py-2.5 rounded-xl font-bold text-xs text-white gradient-btn">
            Explore Smartphones
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <ProductCard key={item.id} product={item.product} onShowToast={onShowToast} />
          ))}
        </div>
      )}

    </div>
  );
}
