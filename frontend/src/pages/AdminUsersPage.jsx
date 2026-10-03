import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      api.get("/admin/users")
        .then((res) => setUsers(res.data.users || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  if (!isAdmin) return <div className="p-8 text-center text-red-400">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>👥</span> Registered Users & Profiles
        </h1>
        <p className="text-xs text-slate-400">Customer account management and order metrics</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading user accounts...</div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Total Orders</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-slate-400">#{u.id}</td>
                    <td className="p-3 font-bold text-white">{u.name}</td>
                    <td className="p-3 text-slate-300">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === "ADMIN" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-indigo-500/20 text-indigo-300"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-indigo-400">{u._count?.orders || 0} orders</td>
                    <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
