import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      api.get("/admin/dashboard")
        .then((res) => setData(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-red-400 font-bold">
        🚫 Access Denied: Admin privileges required.
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading Admin Dashboard metrics...
      </div>
    );
  }

  const { stats, lowStockProducts, recentOrders } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Sub-nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🛡️</span> Admin Overview Dashboard
          </h1>
          <p className="text-xs text-slate-400">Store analytics and stock management</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link to="/admin/products" className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white">
            📱 Manage Products
          </Link>
          <Link to="/admin/orders" className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white">
            📦 Manage Orders
          </Link>
          <Link to="/admin/users" className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white">
            👥 Manage Users
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Products", val: stats.totalProducts, icon: "📱", color: "from-blue-500/20 to-indigo-500/20" },
          { label: "Registered Users", val: stats.totalUsers, icon: "👥", color: "from-purple-500/20 to-pink-500/20" },
          { label: "Total Orders", val: stats.totalOrders, icon: "📦", color: "from-emerald-500/20 to-teal-500/20" },
          { label: "Total Revenue", val: `₹${stats.revenue?.toLocaleString("en-IN")}`, icon: "💰", color: "from-amber-500/20 to-orange-500/20" },
          { label: "Low Stock Alert (<5)", val: stats.lowStockCount, icon: "⚠️", color: "from-red-500/20 to-rose-500/20" },
        ].map((item, idx) => (
          <div key={idx} className={`p-4 rounded-2xl bg-gradient-to-b ${item.color} border border-slate-700/60 space-y-1`}>
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{item.label}</span>
              <span>{item.icon}</span>
            </div>
            <div className="text-xl font-black text-white">{item.val}</div>
          </div>
        ))}
      </div>

      {/* Low Stock Products Alert Container */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span>⚠️</span> Low-Stock Smartphones Alert (&lt; 5 units)
          </h3>
          <Link to="/admin/products" className="text-xs text-indigo-400 hover:underline">
            Update Stock →
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="text-xs text-emerald-400 py-2">✓ All smartphone inventory levels are healthy!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="bg-slate-900/90 p-3 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{p.name}</div>
                  <div className="text-[11px] text-slate-400">{p.brand} • ₹{p.price?.toLocaleString("en-IN")}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 font-extrabold text-xs">
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders Overview Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Recent Customer Orders</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2">Order ID</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 font-bold text-white">#{o.id}</td>
                  <td className="py-3">{o.user?.name || "Customer"}</td>
                  <td className="py-3 font-bold text-indigo-400">₹{o.totalAmount?.toLocaleString("en-IN")}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
