import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function AdminProductsPage({ onShowToast }) {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    name: "",
    brand: "",
    description: "",
    price: 10000,
    discount: 0,
    stock: 20,
    images: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    ram: 8,
    storage: 128,
    processor: "Snapdragon",
    screen: 6.67,
    battery: 5000,
    rearCamera: "50MP Main",
    frontCamera: "16MP",
    os: "Android 14",
    network: "5G",
    categoryId: 1,
  };

  const [form, setForm] = useState(initialForm);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        api.get("/admin/products"),
        api.get("/categories"),
      ]);
      setProducts(pRes.data.products || []);
      setCategories(cRes.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchProducts();
  }, [isAdmin]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      description: p.description,
      price: p.price,
      discount: p.discount,
      stock: p.stock,
      images: p.images?.join("\n") || "",
      ram: p.ram,
      storage: p.storage,
      processor: p.processor,
      screen: p.screen,
      battery: p.battery,
      rearCamera: p.rearCamera,
      frontCamera: p.frontCamera || "",
      os: p.os || "",
      network: p.network || "5G",
      categoryId: p.categoryId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      discount: Number(form.discount),
      stock: Number(form.stock),
      ram: Number(form.ram),
      storage: Number(form.storage),
      screen: Number(form.screen),
      battery: Number(form.battery),
      categoryId: Number(form.categoryId),
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        onShowToast("Product updated successfully!");
      } else {
        await api.post("/admin/products", payload);
        onShowToast("Product created successfully!");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      onShowToast(err.response?.data?.error || "Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this smartphone?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      onShowToast("Product deleted!");
      fetchProducts();
    } catch (err) {
      onShowToast(err.response?.data?.error || "Failed to delete product");
    }
  };

  if (!isAdmin) return <div className="p-8 text-center text-red-400">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📱</span> Smartphone Product Catalog Management
          </h1>
          <p className="text-xs text-slate-400">Add, edit, delete, and update pricing & stock levels</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl font-bold text-xs text-white gradient-btn shadow-lg"
        >
          + Add New Smartphone
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading catalog...</div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price / Disc</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Specs</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="p-3 flex items-center gap-3">
                      <img src={p.images?.[0]} alt="" className="w-10 h-10 object-contain bg-slate-950 p-1 rounded-lg border border-slate-800" />
                      <div>
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-indigo-400">{p.brand}</div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300">{p.category?.name}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">₹{p.price?.toLocaleString("en-IN")}</div>
                      {p.discount > 0 && <div className="text-[10px] text-red-400">-{p.discount}%</div>}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${p.stock < 5 ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-emerald-500/20 text-emerald-300"}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      {p.ram}GB RAM / {p.storage}GB • {p.processor}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(p)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingId ? "Edit Smartphone Specs" : "Add New Smartphone"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Product Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white" />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Brand *</label>
                  <input type="text" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Price (₹) *</label>
                  <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white" />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Discount (%)</label>
                  <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white" />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Stock Count *</label>
                  <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">RAM (GB) *</label>
                  <input type="number" required value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white" />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Storage (GB) *</label>
                  <input type="number" required value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white" />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white">
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Processor *</label>
                  <input type="text" required value={form.processor} onChange={(e) => setForm({ ...form, processor: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white" />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Rear Camera *</label>
                  <input type="text" required value={form.rearCamera} onChange={(e) => setForm({ ...form, rearCamera: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300">Image URLs (one per line) *</label>
                <textarea rows={2} required value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white" />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Description *</label>
                <textarea rows={2} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white" />
              </div>

              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl">
                {editingId ? "Save Changes" : "Create Smartphone"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
