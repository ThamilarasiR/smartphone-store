import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useCartWishlist } from "../context/CartWishlistContext";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailPage({ onShowToast, onOpenAi }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isItemWishlisted } = useCartWishlist();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
      setSelectedImage(res.data.product.images?.[0] || "");
    } catch (err) {
      setError(err.response?.data?.error || "Could not load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-400">Loading smartphone details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-4xl">📱❌</div>
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="text-xs text-slate-400">{error || "The requested device does not exist."}</p>
        <button onClick={() => navigate("/products")} className="px-4 py-2 rounded-xl text-xs font-semibold gradient-btn text-white">
          Back to Catalog
        </button>
      </div>
    );
  }

  const wishlisted = isItemWishlisted(product.id);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      onShowToast(`Added ${quantity} x ${product.name} to cart!`);
    } catch (err) {
      onShowToast(err.message || "Failed to add to cart");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmittingReview(true);
      await api.post(`/products/${product.id}/reviews`, { rating, comment });
      onShowToast("Review submitted successfully!");
      setComment("");
      await fetchProduct();
    } catch (err) {
      onShowToast(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Product Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-96 flex items-center justify-center relative overflow-hidden">
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider z-10 shadow-md">
                {product.discount}% OFF
              </span>
            )}
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Thumbnails list */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl bg-slate-900 border p-2 flex items-center justify-center transition-all ${
                    selectedImage === img
                      ? "border-indigo-500 ring-2 ring-indigo-500/30"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Pricing, Actions */}
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold text-indigo-400 uppercase tracking-widest">
                {product.brand} • {product.category?.name || "Smartphone"}
              </span>
              <button
                onClick={onOpenAi}
                className="text-indigo-300 hover:text-indigo-200 text-xs font-semibold underline flex items-center gap-1"
              >
                <span>✨</span> Compare with INFY AI
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">{product.name}</h1>
            
            {/* Rating Stars */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-amber-400 font-bold">★ {product.avgRating || "New"}</span>
              <span className="text-slate-400">({product.reviewCount} customer review{product.reviewCount !== 1 ? "s" : ""})</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-white">
                ₹{product.finalPrice?.toLocaleString("en-IN")}
              </div>
              {product.discount > 0 && (
                <div className="text-xs text-slate-400 line-through">
                  MRP: ₹{product.price?.toLocaleString("en-IN")} (Inclusive of all taxes)
                </div>
              )}
            </div>

            {/* Stock status indicator */}
            <div>
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold">
                  Out of Stock
                </span>
              ) : product.stock < 5 ? (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold animate-pulse">
                  Low Stock ({product.stock} units left)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  In Stock ({product.stock} units)
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{product.description}</p>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            
            <div className="flex items-center gap-4">
              <label className="text-xs font-semibold text-slate-300">Quantity:</label>
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3 py-1.5 text-slate-300 hover:bg-slate-800 text-sm font-bold disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="px-3 py-1.5 text-slate-300 hover:bg-slate-800 text-sm font-bold disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "gradient-btn shadow-lg shadow-indigo-500/20 active:scale-95"
                }`}
              >
                <span>🛒</span> Add to Cart
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`px-4 py-3 rounded-xl font-bold text-sm border flex items-center gap-2 transition-all ${
                  wishlisted
                    ? "bg-pink-500/20 text-pink-400 border-pink-500/50"
                    : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600"
                }`}
              >
                <span>{wishlisted ? "❤️" : "🤍"}</span>
                <span className="hidden sm:inline">{wishlisted ? "Saved" : "Wishlist"}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Verified GSMArena Specifications Table */}
      <section className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📊</span> Verified Technical Specifications
          </h2>
          <p className="text-xs text-slate-400">GSMArena aligned hardware metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-xs">
          {[
            { label: "Brand", val: product.brand },
            { label: "Processor", val: product.processor },
            { label: "RAM Memory", val: `${product.ram} GB` },
            { label: "Internal Storage", val: `${product.storage} GB` },
            { label: "Screen Display", val: `${product.screen} inches` },
            { label: "Battery Capacity", val: `${product.battery} mAh` },
            { label: "Rear Camera Setup", val: product.rearCamera },
            { label: "Front Selfie Camera", val: product.frontCamera || "N/A" },
            { label: "Operating System", val: product.os || "Android" },
            { label: "Network Connectivity", val: product.network || "5G" },
            { label: "Device Weight", val: product.weight ? `${product.weight} g` : "Standard" },
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400 font-medium">{item.label}</span>
              <span className="text-white font-semibold">{item.val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews & Add Review Section */}
      <section className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-8">
        
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Customer Reviews & Ratings</h2>
            <p className="text-xs text-slate-400">Real feedback from verified buyers</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-amber-400">★ {product.avgRating || 0}</span>
            <span className="text-xs text-slate-400 block">/ 5.0</span>
          </div>
        </div>

        {/* Add Review Form */}
        {user ? (
          <form onSubmit={handleReviewSubmit} className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-200">Write a Review</h3>
            
            <div className="flex items-center gap-4">
              <label className="text-xs text-slate-300">Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="bg-slate-950 text-amber-400 font-bold text-xs border border-slate-700 rounded-lg px-3 py-1"
              >
                <option value={5}>★★★★★ (5/5)</option>
                <option value={4}>★★★★☆ (4/5)</option>
                <option value={3}>★★★☆☆ (3/5)</option>
                <option value={2}>★★☆☆☆ (2/5)</option>
                <option value={1}>★☆☆☆☆ (1/5)</option>
              </select>
            </div>

            <textarea
              rows={3}
              placeholder="Share your experience regarding camera, battery life, and gaming performance..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={submittingReview || !comment.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <div className="p-4 bg-slate-900/60 rounded-2xl text-center text-xs text-slate-400">
            Please <button onClick={() => navigate("/login")} className="text-indigo-400 underline font-bold">login</button> to write a customer review.
          </div>
        )}

        {/* Review list */}
        <div className="space-y-4">
          {product.reviews?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No reviews yet for this product. Be the first to leave feedback!</p>
          ) : (
            product.reviews?.map((r) => (
              <div key={r.id} className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{r.user?.name || "Customer"}</span>
                  <span className="text-amber-400 font-bold">{"★".repeat(r.rating)}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{r.comment}</p>
                <span className="text-[10px] text-slate-500 block pt-1">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>

      </section>

    </div>
  );
}
