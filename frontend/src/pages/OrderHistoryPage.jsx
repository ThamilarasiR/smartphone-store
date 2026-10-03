import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get("/orders")
        .then((res) => setOrders(res.data.orders || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Please login to view your order history.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">Confirmed</span>;
      case "PROCESSING":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">Processing</span>;
      case "SHIPPED":
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">Shipped</span>;
      case "DELIVERED":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">Delivered</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">Pending</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📦</span> My Order History
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <div className="text-4xl">📦</div>
          <h2 className="text-lg font-bold text-white">No Orders Placed Yet</h2>
          <p className="text-xs text-slate-400">Your order history will appear here once you place orders.</p>
          <Link to="/products" className="inline-block px-6 py-2 rounded-xl text-xs font-bold text-white gradient-btn">
            Browse Smartphones
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-xs">
                <div>
                  <span className="font-bold text-white">Order #{order.id}</span>
                  <span className="text-slate-400 ml-3">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="font-extrabold text-indigo-400 text-sm">
                    ₹{order.totalAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <img
                      src={item.product?.images?.[0] || "https://placehold.co/100"}
                      alt=""
                      className="w-12 h-12 object-contain bg-slate-950 p-1 rounded-lg"
                    />
                    <div className="text-xs overflow-hidden">
                      <h4 className="font-bold text-white truncate">{item.product?.name}</h4>
                      <p className="text-slate-400 text-[11px]">Qty: {item.quantity} • ₹{item.price?.toLocaleString("en-IN")} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <Link
                  to={`/orders/${order.id}`}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
                >
                  View Full Order Details →
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
