import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useCartWishlist } from "../context/CartWishlistContext";

export default function InfyAiModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am **INFY AI**, your smart smartphone shopping assistant. I can query our live database to compare specifications, explain price differences, and recommend phones for your exact budget.",
      products: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCartWishlist();
  const [actionToast, setActionToast] = useState("");

  if (!isOpen) return null;

  const quickPrompts = [
    "Phones under ₹30,000 with a good camera",
    "Show 5G gaming phones under ₹25,000",
    "Best phone for a college student under ₹15,000",
    "Which flagship phone is best under ₹75,000?",
  ];

  const handleSend = async (userText) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { sender: "user", text: textToSend }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: textToSend });
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.data.reply,
          products: res.data.products || [],
          type: res.data.type,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I had trouble analyzing the products right now. Please try again.",
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (productId, e) => {
    e.stopPropagation();
    try {
      await addToCart(productId, 1);
      setActionToast("Added to Cart!");
      setTimeout(() => setActionToast(""), 2000);
    } catch (err) {
      setActionToast(err.message || "Please login first");
      setTimeout(() => setActionToast(""), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl h-[650px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm shadow-md">
              ✨
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                INFY AI Shopping Assistant
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Live DB Access
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Understands specs, pricing & comparison</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Toast Alert overlay */}
        {actionToast && (
          <div className="bg-indigo-600 text-white text-xs py-1.5 px-4 text-center font-medium shadow-md">
            {actionToast}
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none"
                }`}
              >
                {/* Parse Markdown Bold headers simply */}
                <div className="whitespace-pre-line">
                  {m.text.split("\n").map((line, i) => (
                    <p key={i} className="mb-1">
                      {line}
                    </p>
                  ))}
                </div>

                {/* Rendered Matched Product Cards */}
                {m.products && m.products.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {m.products.map((p) => (
                      <div
                        key={p.id}
                        className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 flex flex-col justify-between"
                      >
                        <div className="flex gap-2 items-center mb-1.5">
                          <img
                            src={p.images?.[0] || "https://placehold.co/100"}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-lg bg-slate-950"
                          />
                          <div className="overflow-hidden">
                            <h5 className="font-bold text-xs text-white truncate">{p.name}</h5>
                            <p className="text-[10px] text-slate-400">{p.brand} • {p.ram}GB / {p.storage}GB</p>
                            <p className="text-xs font-bold text-indigo-400">
                              ₹{p.finalPrice?.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          <Link
                            to={`/product/${p.id}`}
                            onClick={onClose}
                            className="flex-1 text-center py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium rounded-lg"
                          >
                            View Specs
                          </Link>
                          <button
                            onClick={(e) => handleQuickAdd(p.id, e)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-medium rounded-lg"
                          >
                            + Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              <span>INFY AI is searching inventory and analyzing specs...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/60 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="whitespace-nowrap px-3 py-1 bg-slate-800/80 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 text-[11px] rounded-full border border-slate-700/60 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask INFY AI (e.g. 'Compare iQOO 12 and Poco X6 Pro')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all"
          >
            Send
          </button>
        </form>

      </div>
    </div>
  );
}
