import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useCartWishlist } from "../context/CartWishlistContext";
import { useAuth } from "../context/AuthContext";

export default function CheckoutPage({ onShowToast }) {
  const { cartItems, refreshCartAndWishlist } = useCartWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // Step 1: Address, Step 2: Payment Simulation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "SIMULATED_CARD",
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-4xl">🛒</div>
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">Add smartphones to your cart before proceeding to checkout.</p>
        <button onClick={() => navigate("/products")} className="px-6 py-2.5 rounded-xl font-bold text-xs text-white gradient-btn">
          Return to Store
        </button>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.finalPrice * item.quantity,
    0
  );

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address || !form.city || !form.pincode) {
      setError("Please fill out all delivery address fields.");
      return;
    }
    setError("");
    setStep(2); // Proceed to simulated payment step
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post("/orders", form);
      await refreshCartAndWishlist();
      onShowToast("Order placed successfully!");
      navigate(`/order-confirmation/${res.data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to place order");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Step Indicator Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📦</span> Checkout & Order Placement
        </h1>

        <div className="flex items-center gap-4 mt-4 text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-indigo-400" : "text-slate-500"}`}>
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
            <span>Shipping Address</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-indigo-400" : "text-slate-500"}`}>
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
            <span>Simulated Payment</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          
          {step === 1 && (
            <form onSubmit={handleAddressSubmit} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                1. Delivery & Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-300">Flat / Street / Area Address *</label>
                <textarea
                  rows={2}
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Postal Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="6-digit pincode"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs text-white gradient-btn mt-4"
              >
                Proceed to Payment Simulation →
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">
                  2. Simulated Payment Gateway (No Real Charges)
                </h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  ← Edit Address
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                ℹ️ <strong>INFYHACKATHON Note</strong>: Real payment gateway is not integrated. Select a payment option below to simulate order completion.
              </div>

              <div className="space-y-3">
                {[
                  { id: "SIMULATED_CARD", name: "Simulated Credit / Debit Card", desc: "Instant approval test card" },
                  { id: "SIMULATED_UPI", name: "Simulated Instant UPI", desc: "GPay / PhonePe / Paytm simulation" },
                  { id: "COD", name: "Cash on Delivery", desc: "Pay upon physical product delivery" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                      form.paymentMethod === opt.id
                        ? "bg-indigo-950/60 border-indigo-500 text-white"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={form.paymentMethod === opt.id}
                      onChange={() => setForm({ ...form, paymentMethod: opt.id })}
                      className="accent-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-bold">{opt.name}</div>
                      <div className="text-[11px] text-slate-400">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-sm text-white gradient-btn shadow-xl shadow-indigo-500/25 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing Order & Deducting Stock...</span>
                    </>
                  ) : (
                    <span>Confirm Order & Pay ₹{subtotal.toLocaleString("en-IN")} 🎉</span>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Order Items Sidebar Preview */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
            Order Items Summary
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-xs">
                <img
                  src={item.product.images?.[0]}
                  alt=""
                  className="w-12 h-12 object-contain bg-slate-950 p-1 rounded-lg border border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{item.product.name}</div>
                  <div className="text-[11px] text-slate-400">Qty: {item.quantity}</div>
                </div>
                <div className="font-bold text-indigo-400">
                  ₹{(item.product.finalPrice * item.quantity).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-black text-white">
            <span>Total Payable:</span>
            <span className="text-indigo-400">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
