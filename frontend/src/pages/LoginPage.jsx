import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ onShowToast }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await login(email, password);
      onShowToast(`Welcome back, ${res.user.name}!`);
      if (res.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/products");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (type) => {
    if (type === "admin") {
      setEmail("admin@store.com");
      setPassword("Admin@123");
    } else {
      setEmail("user@store.com");
      setPassword("User@123");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        
        <div className="text-center space-y-2">
          <span className="w-12 h-12 rounded-2xl gradient-btn flex items-center justify-center text-white text-2xl mx-auto shadow-md">
            ⚡
          </span>
          <h1 className="text-2xl font-black text-white">Sign In</h1>
          <p className="text-xs text-slate-400">Access your cart, wishlist, and orders</p>
        </div>

        {/* Demo Quick Fill Buttons for Hackathon Judges */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
            ⚡ Demo Quick Fill Credentials
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill("customer")}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium rounded-lg text-center"
            >
              👤 Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("admin")}
              className="py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-medium rounded-lg text-center"
            >
              🛡️ Admin Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. user@store.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-xs text-white gradient-btn shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? "Signing in..." : "Login to Account"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:underline font-bold">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}
