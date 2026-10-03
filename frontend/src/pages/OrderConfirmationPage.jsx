import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-xs text-slate-400">
        Fetching order confirmation...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-center">
      
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-4xl mx-auto shadow-xl">
        ✓
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white">Order Confirmed!</h1>
        <p className="text-xs text-slate-400">
          Thank you for your order. Your smartphones are being prepared for dispatch.
        </p>
        <span className="inline-block px-3 py-1 bg-slate-800 text-indigo-400 text-xs font-bold rounded-full border border-slate-700 mt-2">
          Order ID: #{orderId}
        </span>
      </div>

      {order && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-left space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
            Shipping & Order Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Deliver To:</span>
              <div className="font-bold text-white mt-0.5">{order.fullName}</div>
              <div className="text-slate-300">{order.address}, {order.city} - {order.pincode}</div>
              <div className="text-slate-400">Phone: {order.phone}</div>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Payment Status:</span>
              <div className="font-bold text-emerald-400 mt-0.5">{order.paymentMethod} (PAID)</div>
              <div className="text-slate-400 mt-2">Total Paid: <strong className="text-white">₹{order.totalAmount?.toLocaleString("en-IN")}</strong></div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300">Items Ordered:</span>
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="font-semibold text-white">{item.product?.name} x {item.quantity}</div>
                <div className="font-bold text-indigo-400">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4 pt-4">
        <Link to="/orders" className="px-6 py-2.5 rounded-xl font-bold text-xs text-white gradient-btn">
          View Order History
        </Link>
        <Link to="/products" className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-300 bg-slate-900 border border-slate-700 hover:text-white">
          Continue Shopping
        </Link>
      </div>

    </div>
  );
}
