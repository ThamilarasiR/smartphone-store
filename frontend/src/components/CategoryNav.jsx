import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

export default function CategoryNav() {
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const activeCatId = searchParams.get("category");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categories").then((res) => {
      setCategories(res.data.categories || []);
    }).catch(() => {});
  }, []);

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800/80 py-2.5 px-4 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs">
        <Link
          to="/products"
          className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
            !activeCatId
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          📱 All Smartphones
        </Link>

        {categories.map((cat) => {
          const isActive = activeCatId === String(cat.id);
          return (
            <div key={cat.id} className="relative group inline-block">
              <button
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span>{cat.name}</span>
                {cat.children?.length > 0 && <span className="text-[10px] text-slate-400">▾</span>}
              </button>

              {/* Subcategories Dropdown */}
              {cat.children?.length > 0 && (
                <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-30 bg-slate-900 border border-slate-700/80 rounded-xl p-2 shadow-xl min-w-[160px]">
                  {cat.children.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => navigate(`/products?category=${sub.id}`)}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-indigo-400 transition-colors"
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
