import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
              <span className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center text-xs">⚡</span>
              <span>INFY<span className="gradient-text">PHONES</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your ultimate smartphone store built for INFYHACKATHON 2.0. Real product specifications, simulated checkout, and AI recommendations.
            </p>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=1" className="hover:text-indigo-400">Budget Smartphones</Link></li>
              <li><Link to="/products?category=2" className="hover:text-indigo-400">Mid-range Powerhouses</Link></li>
              <li><Link to="/products?category=3" className="hover:text-indigo-400">Flagship Devices</Link></li>
              <li><Link to="/products?category=4" className="hover:text-indigo-400">Gaming Phones</Link></li>
              <li><Link to="/products?category=5" className="hover:text-indigo-400">Camera Specialists</Link></li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/orders" className="hover:text-indigo-400">Track Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-indigo-400">My Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-indigo-400">Shopping Cart</Link></li>
              <li><span className="text-slate-500">100% Simulated Payment (Safe)</span></li>
            </ul>
          </div>

          {/* Col 4: Verified Specs */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3">Spec Verification</h4>
            <p className="text-xs text-slate-400 mb-2">
              All smartphone specs (RAM, Chipset, Sensors, Battery) are verified for GSMArena accuracy.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-medium">
              <span>🛡️</span> 100% Verified Hardware Specs
            </div>
          </div>

        </div>

        <div className="border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 INFYPHONES - Built for INFYHACKATHON 2.0 (Infynux Academy).</p>
          <p className="text-slate-400">Designed with React + Vite + Tailwind CSS + Node.js + Prisma</p>
        </div>
      </div>
    </footer>
  );
}
