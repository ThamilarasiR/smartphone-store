import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";

export default function ProductListingPage({ onShowToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters metadata
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Local filter states driven by URL search parameters
  const search = searchParams.get("search") || "";
  const brand = searchParams.get("brand") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const ram = searchParams.get("ram") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch filter metadata once
  useEffect(() => {
    api.get("/products/meta/filters").then((res) => {
      setCategories(res.data.categories || []);
      setBrands(res.data.brands || []);
    }).catch(() => {});
  }, []);

  // Fetch products whenever search params change
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams);
        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Fetch products error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1"); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Results Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📱</span> Smartphone Catalog
          </h1>
          <p className="text-xs text-slate-400">
            Showing {total} product{total !== 1 ? "s" : ""}
            {search && <span> matching "<span className="text-indigo-400">{search}</span>"</span>}
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700"
          >
            ⚙️ Filters
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="bg-slate-900 text-slate-100 text-xs border border-slate-700/80 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar (Desktop & Mobile Drawer) */}
        <aside className={`lg:block ${mobileFilterOpen ? "block" : "hidden"} space-y-6`}>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-6">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Filter Products
              </h3>
              {(brand || category || minPrice || maxPrice || ram || search) && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-red-400 hover:text-red-300 font-medium"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => updateParam("category", e.target.value)}
                className="w-full bg-slate-900 text-slate-200 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Brand</label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                <button
                  onClick={() => updateParam("brand", "")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                    !brand
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  All
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => updateParam("brand", b)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                      brand === b
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* RAM Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Minimum RAM</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[4, 6, 8, 12].map((r) => (
                  <button
                    key={r}
                    onClick={() => updateParam("ram", ram === String(r) ? "" : String(r))}
                    className={`py-1 rounded text-[11px] font-medium border text-center ${
                      ram === String(r)
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    {r}GB+
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => updateParam("minPrice", e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => updateParam("maxPrice", e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

          </div>
        </aside>

        {/* Product Grid & Pagination */}
        <main className="lg:col-span-3 space-y-6">
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-slate-900/60 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-4">
              <div className="text-4xl">🔍</div>
              <h3 className="text-lg font-bold text-white">No smartphones matched your criteria</h3>
              <p className="text-xs text-slate-400">Try adjusting your price range, RAM filter, or search keywords.</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold gradient-btn text-white"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onShowToast={onShowToast} />
              ))}
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-800">
              <button
                disabled={page <= 1}
                onClick={() => updateParam("page", String(page - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-xs font-medium text-slate-300 border border-slate-700 disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-xs text-slate-400">
                Page <strong className="text-white">{page}</strong> of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => updateParam("page", String(page + 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-xs font-medium text-slate-300 border border-slate-700 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
