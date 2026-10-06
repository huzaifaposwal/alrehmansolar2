"use client";

import { useEffect, useState, useCallback } from "react";
import {
  HelpCircle, Plus, Pencil, Trash2, X, Save, ToggleLeft,
  ToggleRight, ChevronDown, ChevronRight, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import type { FAQ } from "@/types";
import { cn } from "@/lib/utils";

type FormState = {
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
};

const EMPTY_FORM: FormState = {
  question: "", answer: "", category: "", display_order: 0, is_published: false,
};

const FAQ_CATEGORIES = [
  "General", "Installation", "Products", "Pricing", "Maintenance",
  "Warranty", "Solar Calculator", "Net Metering", "Battery/UPS"
];

export default function AdminFAQsPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editItem, setEditItem] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<string>("all");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllFAQs(token);
      setItems(data || []);
    } catch {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setModal("add"); };
  const openEdit = (f: FAQ) => {
    setForm({ question: f.question, answer: f.answer, category: f.category || "", display_order: f.display_order, is_published: f.is_published });
    setEditItem(f);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.question || !form.answer) { toast.error("Question and answer required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, display_order: Number(form.display_order) };
      if (modal === "add") await adminApi.createFAQ(token, payload);
      else if (editItem) await adminApi.updateFAQ(token, editItem.id, payload);
      toast.success(modal === "add" ? "FAQ added!" : "FAQ updated!");
      setModal(null);
      fetchData();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, q: string) => {
    if (!confirm(`Delete FAQ: "${q.slice(0, 50)}…"?`)) return;
    try { await adminApi.deleteFAQ(token, id); toast.success("Deleted"); fetchData(); }
    catch { toast.error("Failed to delete"); }
  };

  const togglePublish = async (f: FAQ) => {
    try {
      await adminApi.updateFAQ(token, f.id, {
        question: f.question, answer: f.answer, category: f.category,
        display_order: f.display_order, is_published: !f.is_published,
      });
      setItems(prev => prev.map(x => x.id === f.id ? { ...x, is_published: !x.is_published } : x));
      toast.success(f.is_published ? "Unpublished" : "Published");
    } catch { toast.error("Failed to update"); }
  };

  // Group by category
  const allCats = ["all", ...Array.from(new Set(items.map(f => f.category || "Uncategorized").filter(Boolean)))];
  const filtered = catFilter === "all" ? items : items.filter(f => (f.category || "Uncategorized") === catFilter);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">FAQs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.filter(f => f.is_published).length} published · {items.length} total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 shadow-sm">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button onClick={openAdd} className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {allCats.map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
              catFilter === cat
                ? "bg-green-600 text-white border-green-600"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            )}
          >
            {cat === "all" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {/* FAQ accordion list */}
      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No FAQs yet. Click "Add FAQ" to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(f => (
            <div key={f.id} className={cn(
              "bg-white rounded-xl border overflow-hidden transition-all",
              f.is_published ? "border-gray-100 shadow-sm" : "border-dashed border-gray-200"
            )}>
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === f.id ? null : f.id)}
              >
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", f.is_published ? "bg-green-500" : "bg-gray-300")} />
                <p className="flex-1 font-medium text-gray-800 text-sm">{f.question}</p>
                {f.category && (
                  <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full hidden sm:block flex-shrink-0">
                    {f.category}
                  </span>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={e => { e.stopPropagation(); openEdit(f); }} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); togglePublish(f); }} className={cn("p-1.5 rounded-lg transition-colors", f.is_published ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-200")}>
                    {f.is_published ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(f.id, f.question); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expanded === f.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expanded === f.id && (
                <div className="px-5 pb-4 pt-0 border-t border-gray-100 bg-gray-50">
                  <p className="text-sm text-gray-600 leading-relaxed pt-3">{f.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h2 className="font-bold text-navy-900 font-heading text-lg">
                {modal === "add" ? "Add FAQ" : "Edit FAQ"}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="form-label">Question *</label>
                <input className="form-input" value={form.question} onChange={e => setForm({...form, question: e.target.value})} placeholder="What is the average payback period for solar in Lahore?" />
              </div>
              <div>
                <label className="form-label">Answer *</label>
                <textarea className="form-input resize-none" rows={5} value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} placeholder="The typical payback period…" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="">Select category…</option>
                    {FAQ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Display Order</label>
                  <input type="number" className="form-input" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})} min={0} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} className="w-4 h-4 accent-green-600" />
                <span className="font-medium text-gray-700">Publish on website</span>
              </label>
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
