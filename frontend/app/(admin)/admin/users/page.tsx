"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UserCog, Plus, Shield, Pencil, Trash2, X, Save, Mail,
  CheckCircle2, XCircle, Crown, User, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: "super_admin" | "admin" | "editor";
  is_active: boolean;
  created_at: string;
}

type FormState = {
  email: string;
  full_name: string;
  password: string;
  role: AdminUser["role"];
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  email: "", full_name: "", password: "", role: "admin", is_active: true,
};

const ROLE_META: Record<AdminUser["role"], { label: string; color: string; icon: typeof Crown }> = {
  super_admin: { label: "Super Admin",  color: "bg-red-100 text-red-700",    icon: Crown },
  admin:       { label: "Admin",        color: "bg-blue-100 text-blue-700",  icon: Shield },
  editor:      { label: "Editor",       color: "bg-purple-100 text-purple-700", icon: User },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editItem, setEditItem] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(token);
      setUsers(data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
    try {
      const stored = localStorage.getItem("admin_user");
      if (stored) setCurrentUserId(JSON.parse(stored)?.id);
    } catch {}
  }, [fetchUsers]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setModal("add"); };
  const openEdit = (u: AdminUser) => {
    setForm({ email: u.email, full_name: u.full_name || "", password: "", role: u.role, is_active: u.is_active });
    setEditItem(u);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.email) { toast.error("Email required"); return; }
    if (modal === "add" && !form.password) { toast.error("Password required for new users"); return; }
    if (form.password && form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }

    setSaving(true);
    try {
      if (modal === "add") {
        await adminApi.createUser(token, form);
        toast.success("User created!");
      } else if (editItem) {
        const payload: any = { email: form.email, full_name: form.full_name, role: form.role, is_active: form.is_active };
        if (form.password) payload.password = form.password;
        await adminApi.updateUser(token, editItem.id, payload);
        toast.success("User updated!");
      }
      setModal(null);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (id === currentUserId) { toast.error("You cannot delete your own account!"); return; }
    if (!confirm(`Delete user "${email}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(token, id);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Admin Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} user{users.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 shadow-sm">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button onClick={openAdd} className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> The User Management API requires the <code className="bg-amber-100 px-1 rounded">/api/v1/auth/users</code> endpoint 
        to be available on the backend. If you see errors, this endpoint may need to be added first.
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array(3).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl skeleton" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <UserCog className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No users found. Add an admin user to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Role</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Joined</th>
                <th className="text-right px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => {
                const roleMeta = ROLE_META[u.role] || ROLE_META.admin;
                const RoleIcon = roleMeta.icon;
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className={cn("hover:bg-gray-50 transition-colors", isSelf && "bg-green-50/40")}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(u.full_name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">{u.full_name || "—"}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />{u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", roleMeta.color)}>
                        <RoleIcon className="w-3 h-3" />{roleMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.is_active
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500"><XCircle className="w-3.5 h-3.5" /> Inactive</span>
                      }
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 hidden md:table-cell">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {!isSelf && (
                          <button onClick={() => handleDelete(u.id, u.email)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {isSelf && (
                          <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">You</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-navy-900 font-heading text-lg">
                {modal === "add" ? "Add Admin User" : "Edit User"}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="John Smith" />
              </div>
              <div>
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@alrehmansolars.com" />
              </div>
              <div>
                <label className="form-label">{modal === "add" ? "Password *" : "New Password (leave blank to keep current)"}</label>
                <input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 8 characters" />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value as AdminUser["role"]})}>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 accent-green-600" />
                <span className="font-medium text-gray-700">Active (can log in)</span>
              </label>
            </div>
            <div className="p-5 border-t flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="btn-secondary py-2 px-5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> {modal === "add" ? "Create User" : "Save Changes"}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
