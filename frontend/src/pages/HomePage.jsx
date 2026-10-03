import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";

export default function HomePage({ onShowToast, onOpenAi }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [gamingPhones, setGamingPhones] = useState([]);
  const [flagships, setFlagships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [featRes, gameRes, flagRes] = await Promise.all([
          api.get("/products?limit=8&sort=newest"),
          api.get("/products?category=4&limit=4"), // Gaming
          api.get("/products?category=3&limit=4"), // Flagship
        ]);
        setFeaturedProducts(featRes.data.products || []);
        setGamingPhones(gameRes.data.products || []);
        setFlagships(flagRes.data.products || []);
      } catch (err) {
        console.error("Home load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <span>🚀</span> INFYHACKATHON 2.0 Official Niche Project
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Next-Gen <br />
              <span className="gradient-text">Smartphones</span> Delivered.
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Explore 30+ verified smartphones with real GSMArena specs, compare performance, check live stock, and get instant recommendations with **INFY AI**.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="px-6 py-3 rounded-xl font-bold text-sm text-white gradient-btn shadow-lg shadow-indigo-500/25 hover:scale-105 transition-transform"
              >
                Browse All Phones 📱
              </Link>
              <button
                onClick={onOpenAi}
                className="px-6 py-3 rounded-xl font-bold text-sm text-indigo-300 bg-slate-900 border border-indigo-500/40 hover:bg-slate-800 hover:border-indigo-400 transition-all flex items-center gap-2"
              >
                <span>✨</span> Ask INFY AI
              </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-md mx-auto lg:mx-0 text-center border-t border-slate-800/80">
              <div>
                <div className="text-xl font-black text-white">30+</div>
                <div className="text-[11px] text-slate-400">Verified Devices</div>
              </div>
              <div>
                <div className="text-xl font-black text-indigo-400">100%</div>
                <div className="text-[11px] text-slate-400">Real Specs</div>
              </div>
              <div>
                <div className="text-xl font-black text-purple-400">24/7</div>
                <div className="text-[11px] text-slate-400">AI Assistant</div>
              </div>
            </div>
          </div>

          {/* Hero Feature Showcase Card */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-md glass-card p-6 rounded-3xl relative z-10 border border-slate-700/60 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  ⭐ Featured Flagship
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  Save 8%
                </span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
                alt="Galaxy S24 Ultra"
                className="w-full h-56 object-cover rounded-2xl mb-4 bg-slate-950"
              />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Samsung Galaxy S24 Ultra</h3>
                  <p className="text-xs text-slate-400">Snapdragon 8 Gen 3 • 200MP Quad Camera</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-indigo-400">₹1,29,999</div>
                  <div className="text-xs text-slate-500 line-through">₹1,39,999</div>
                </div>
              </div>
            </div>
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          </div>

        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl font-bold text-white">Explore Smartphone Categories</h2>
          <p className="text-xs text-slate-400">Find the perfect device tailored for your budget & performance needs</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { id: 1, name: "Budget", desc: "Under ₹12,000", icon: "💰", color: "from-blue-500/20 to-indigo-500/20" },
            { id: 2, name: "Mid-range", desc: "₹15,000 - ₹30,000", icon: "⚡", color: "from-purple-500/20 to-pink-500/20" },
            { id: 3, name: "Flagship", desc: "Premium Laptops & Phones", icon: "👑", color: "from-amber-500/20 to-orange-500/20" },
            { id: 4, name: "Gaming", desc: "120Hz & High FPS", icon: "🎮", color: "from-emerald-500/20 to-teal-500/20" },
            { id: 5, name: "Camera Phones", desc: "ZEISS & 200MP OIS", icon: "📸", color: "from-rose-500/20 to-pink-500/20" },
          ].map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className={`p-4 rounded-2xl bg-gradient-to-b ${cat.color} border border-slate-700/60 hover:border-indigo-500/60 transition-all hover:-translate-y-1 group text-center space-y-2`}
            >
              <div className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h3 className="font-bold text-white text-sm">{cat.name}</h3>
              <p className="text-[11px] text-slate-400">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">🔥 Trending Smartphones</h2>
            <p className="text-xs text-slate-400">Fresh stock available for instant order placement</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-slate-900/60 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} onShowToast={onShowToast} />
            ))}
          </div>
        )}
      </section>

      {/* Esports & Gaming Highlights */}
      {gamingPhones.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🎮</span> Esports & High FPS Gaming Beasts
                </h2>
                <p className="text-xs text-slate-400">Optimized cooling vapor chambers and high refresh rate displays</p>
              </div>
              <Link to="/products?category=4" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                Explore Gaming →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gamingPhones.map((product) => (
                <ProductCard key={product.id} product={product} onShowToast={onShowToast} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flagships Showcase */}
      {flagships.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>👑</span> Ultra & Compact Flagships
              </h2>
              <p className="text-xs text-slate-400">Titanium bodies, periscope cameras, and top tier processors</p>
            </div>
            <Link to="/products?category=3" className="text-xs font-semibold text-purple-400 hover:text-purple-300">
              Explore Flagships →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flagships.map((product) => (
              <ProductCard key={product.id} product={product} onShowToast={onShowToast} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
