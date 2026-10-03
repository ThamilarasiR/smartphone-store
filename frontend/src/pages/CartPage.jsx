import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartWishlist } from "../context/CartWishlistContext";
import { useAuth } from "../context/AuthContext";

export default function CartPage({ onShowToast }) {
  const { cartItems, updateCartQty, removeFromCart } = useCartWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-4xl">🛒🔒</div>
        <h2 className="text-xl font-bold text-white">Please Login to View Cart</h2>
        <p className="text-xs text-slate-400">Manage your cart and proceed to checkout securely.</p>
        <button onClick={() => navigate("/login")} className="px-6 py-2.5 rounded-xl font-bold text-xs text-white gradient-btn">
          Login Now
        </button>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.finalPrice * item.quantity,
    0
  );
  const totalSavings = cartItems.reduce(
    (sum, item) =>
      sum + (item.product.price - item.product.finalPrice) * item.quantity,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🛒</span> Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <div className="text-5xl">🛍️</div>
          <h2 className="text-lg font-bold text-white">Your Cart is Empty</h2>
          <p className="text-xs text-slate-400">Explore our latest smartphones and add them to your cart.</p>
          <Link to="/products" className="inline-block px-6 py-2.5 rounded-xl font-bold text-xs text-white gradient-btn">
            Browse Smartphones
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.product.images?.[0] || "https://placehold.co/100"}
                    alt={item.product.name}
                    className="w-20 h-20 object-contain bg-slate-950 p-2 rounded-xl border border-slate-800"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">
                      {item.product.brand}
                    </span>
                    <Link to={`/product/${item.product.id}`} className="block">
                      <h3 className="font-bold text-sm text-white hover:text-indigo-300 transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-xs font-bold text-white mt-1">
                      ₹{item.product.finalPrice?.toLocaleString("en-IN")}
                      {item.product.discount > 0 && (
                        <span className="text-[10px] text-slate-500 line-through ml-2">
                          ₹{item.product.price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Qty and Remove Action */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-0 pt-3 sm:pt-0 border-slate-800">
                  <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl">
                    <button
                      onClick={() => updateCartQty(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 text-slate-300 hover:bg-slate-800 text-xs font-bold disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="px-2.5 py-1 text-slate-300 hover:bg-slate-800 text-xs font-bold disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-indigo-400">
                      ₹{(item.product.finalPrice * item.quantity).toLocaleString("en-IN")}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[10px] text-red-400 hover:text-red-300 underline mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Cart Order Summary Box */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Cart Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Price</span>
                <span className="text-white font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount Savings</span>
                  <span className="font-semibold">- ₹{totalSavings.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge</span>
                <span className="text-emerald-400 font-bold">FREE</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-extrabold text-white">
                <span>Total Payable</span>
                <span className="text-indigo-400 text-lg">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white gradient-btn shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Proceed to Checkout →
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
