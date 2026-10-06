"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Star, Plus, Pencil, Trash2, X, Save, ToggleLeft, ToggleRight, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import type { Testimonial } from "@/types";
import { cn } from "@/lib/utils";

type FormState = {
  customer_name: string;
  location: string;
  rating: number;
  review: string;
  image_url: string;
  is_published: boolean;
  display_order: number;
};

const EMPTY_FORM: FormState = {
  customer_name: "", location: "", rating: 5, review: "",
  image_url: "", is_published: false, display_order: 0,
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editItem, setEditItem] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllTestimonials(token);
      setItems(data || []);
    } catch {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setModal("add"); };
  const openEdit = (t: Testimonial) => {
    setForm({
      customer_name: t.customer_name,
      location: t.location || "",
      rating: t.rating,
      review: t.review,
      image_url: t.image_url || "",
      is_published: t.is_published,
      display_order: t.display_order,
    });
    setEditItem(t);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.customer_name || !form.review) {
      toast.error("Name and review are required");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, display_order: Number(form.display_order) };
      if (modal === "add") await adminApi.createTestimonial(token, payload);
      else if (editItem) await adminApi.updateTestimonial(token, editItem.id, payload);
      toast.success(modal === "add" ? "Testimonial added!" : "Updated!");
      setModal(null);
      fetchData();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    try {
      await adminApi.deleteTestimonial(token, id);
      toast.success("Deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const togglePublish = async (t: Testimonial) => {
    try {
      await adminApi.updateTestimonial(token, t.id, {
        customer_name: t.customer_name, location: t.location, rating: t.rating,
        review: t.review, image_url: t.image_url, display_order: t.display_order,
        is_published: !t.is_published,
      });
      setItems(prev => prev.map(x => x.id === t.id ? { ...x, is_published: !x.is_published } : x));
      toast.success(t.is_published ? "Unpublished" : "Published");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Testimonials</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.filter(i => i.is_published).length} published · {items.length} total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 shadow-sm">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button onClick={openAdd} className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Add Testimonial
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-36 rounded-2xl skeleton" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No testimonials yet. Click "Add Testimonial" to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map(t => (
            <div key={t.id} className={cn(
              "bg-white rounded-2xl border p-5 transition-all",
              t.is_published ? "border-gray-100 shadow-sm" : "border-dashed border-gray-200 opacity-70"
            )}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {t.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">{t.customer_name}</p>
                    {t.location && <p className="text-xs text-gray-400">{t.location}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={cn("w-3.5 h-3.5", n <= t.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">"{t.review}"</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={() => togglePublish(t)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold transition-colors",
                    t.is_published ? "text-green-600" : "text-gray-400"
                  )}
                >
                  {t.is_published
                    ? <ToggleRight className="w-5 h-5" />
                    : <ToggleLeft className="w-5 h-5" />
                  }
                  {t.is_published ? "Published" : "Draft"}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(t.id, t.customer_name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h2 className="font-bold text-navy-900 font-heading text-lg">
                {modal === "add" ? "Add Testimonial" : "Edit Testimonial"}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Customer Name *</label>
                  <input className="form-input" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} placeholder="John Smith" />
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Lahore, Pakistan" />
                </div>
              </div>

              <div>
                <label className="form-label">Rating</label>
                <div className="flex items-center gap-2 mt-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setForm({...form, rating: n})}>
                      <Star className={cn("w-7 h-7 transition-colors", n <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200")} />
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">{form.rating}/5</span>
                </div>
              </div>

              <div>
                <label className="form-label">Review *</label>
                <textarea className="form-input resize-none" rows={4} value={form.review} onChange={e => setForm({...form, review: e.target.value})} placeholder="Customer's review text…" />
              </div>

              <div>
                <label className="form-label">Photo URL (optional)</label>
                <input className="form-input" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://…/photo.jpg" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Display Order</label>
                  <input type="number" className="form-input" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})} min={0} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm cursor-pointer pb-3">
                    <input type="checkbox" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} className="w-4 h-4 accent-green-600" />
                    <span className="font-medium text-gray-700">Publish immediately</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-5 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setModal(null)} className="btn-secondary py-2 px-5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
