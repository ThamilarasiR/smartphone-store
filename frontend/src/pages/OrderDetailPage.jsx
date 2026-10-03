import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto py-16 text-center text-xs text-slate-400">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-400 space-y-4">
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <Link to="/orders" className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">
          Back to Orders
        </Link>
      </div>
    );
  }

  // Order status flow visualization
  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIdx = statuses.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Order #{order.id}</h1>
          <p className="text-xs text-slate-400">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <Link to="/orders" className="text-xs font-semibold text-indigo-400 hover:underline">
          ← Back to Order History
        </Link>
      </div>

      {/* Visual Order Status Flow Tracker */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Order Delivery Tracker</h3>
        <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-semibold">
          {statuses.map((st, idx) => {
            const isDone = idx <= currentIdx;
            return (
              <div key={st} className="space-y-1">
                <div
                  className={`h-2 rounded-full transition-colors ${
                    isDone ? "bg-indigo-500 shadow-md shadow-indigo-500/30" : "bg-slate-800"
                  }`}
                ></div>
                <span className={isDone ? "text-indigo-300 font-bold" : "text-slate-500"}>
                  {st}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Address & Payment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <h4 className="font-bold text-white border-b border-slate-800 pb-2">Shipping Address</h4>
          <p className="text-slate-200 font-bold">{order.fullName}</p>
          <p className="text-slate-300">{order.address}, {order.city} - {order.pincode}</p>
          <p className="text-slate-400">Phone: {order.phone}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <h4 className="font-bold text-white border-b border-slate-800 pb-2">Payment Details</h4>
          <p className="text-slate-300">Method: <strong className="text-white">{order.paymentMethod}</strong></p>
          <p className="text-slate-300">Total Amount: <strong className="text-indigo-400 text-sm">₹{order.totalAmount?.toLocaleString("en-IN")}</strong></p>
          <p className="text-emerald-400 font-semibold">Payment Status: Approved</p>
        </div>
      </div>

      {/* Itemized Snapshot */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
          Ordered Products
        </h3>

        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <img src={item.product?.images?.[0]} alt="" className="w-12 h-12 object-contain bg-slate-950 p-1 rounded-lg" />
                <div>
                  <h4 className="font-bold text-white">{item.product?.name}</h4>
                  <p className="text-slate-400">{item.product?.ram}GB RAM / {item.product?.storage}GB Storage</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-indigo-400">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                <div className="text-[10px] text-slate-400">Qty: {item.quantity} x ₹{item.price?.toLocaleString("en-IN")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
