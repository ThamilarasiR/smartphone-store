import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function AdminOrdersPage({ onShowToast }) {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      onShowToast(`Order #${orderId} status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      onShowToast(err.response?.data?.error || "Failed to update status");
    }
  };

  if (!isAdmin) return <div className="p-8 text-center text-red-400">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📦</span> Admin Order Workflow Management
        </h1>
        <p className="text-xs text-slate-400">Manage status transitions: Pending → Confirmed → Processing → Shipped → Delivered</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-400">No customer orders placed yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                <div>
                  <span className="font-bold text-white">Order #{o.id}</span>
                  <span className="text-slate-400 ml-3">Customer: <strong className="text-slate-200">{o.user?.name}</strong> ({o.user?.email})</span>
                </div>

                {/* Order status dropdown selector */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Status:</span>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="bg-slate-900 text-indigo-300 font-bold text-xs border border-indigo-500/50 rounded-lg px-2.5 py-1 focus:outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Shipping Address:</span>
                  <div className="text-slate-200">{o.fullName} • {o.phone}</div>
                  <div className="text-slate-400">{o.address}, {o.city} - {o.pincode}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Payment: {o.paymentMethod}</div>
                  <div className="text-lg font-black text-indigo-400">₹{o.totalAmount?.toLocaleString("en-IN")}</div>
                </div>
              </div>

              {/* Items List */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-2 text-xs">
                {o.items?.map((item) => (
                  <span key={item.id} className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                    {item.product?.name} (Qty: {item.quantity})
                  </span>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
