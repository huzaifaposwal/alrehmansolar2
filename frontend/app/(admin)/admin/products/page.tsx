"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package, Plus, Pencil, Trash2, X, Save, Search, RefreshCw,
  Star, ToggleLeft, ToggleRight, Image as ImageIcon, Tag, Upload
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { slugify, cn } from "@/lib/utils";
import type { Product, ProductCategory } from "@/types";

type FormState = {
  name: string; slug: string; brand: string; model: string;
  category_id: string; description: string; price: string;
  images: string; is_available: boolean; is_featured: boolean;
  seo_title: string; seo_description: string;
};

const EMPTY_FORM: FormState = {
  name: "", slug: "", brand: "", model: "", category_id: "", description: "",
  price: "", images: "", is_available: true, is_featured: false,
  seo_title: "", seo_description: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        adminApi.getAdminProducts(token, { page_size: 100 }),
        adminApi.getAdminProductCategories(token),
      ]);
      setProducts(prodData?.items || []);
      setTotal(prodData?.total || 0);
      setCategories(catData || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: f.slug || slugify(name) }));
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setModal("add"); };
  const openEdit = (p: Product) => {
    setForm({
      name: p.name, slug: p.slug, brand: p.brand || "", model: p.model || "",
      category_id: p.category_id || "", description: p.description || "",
      price: p.price != null ? String(p.price) : "",
      images: (p.images || []).join("\n"),
      is_available: p.is_available, is_featured: p.is_featured,
      seo_title: p.seo_title || "", seo_description: p.seo_description || "",
    });
    setEditItem(p);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error("Name and slug are required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name, slug: form.slug.trim().toLowerCase(),
        brand: form.brand || null, model: form.model || null,
        category_id: form.category_id || null,
        description: form.description || null,
        price: form.price ? parseFloat(form.price) : null,
        images: form.images ? form.images.split("\n").map(s => s.trim()).filter(Boolean) : [],
        is_available: form.is_available, is_featured: form.is_featured,
        seo_title: form.seo_title || null, seo_description: form.seo_description || null,
      };
      if (modal === "add") await adminApi.createProduct(token, payload);
      else if (editItem) await adminApi.updateProduct(token, editItem.id, payload);
      toast.success(modal === "add" ? "Product created!" : "Product updated!");
      setModal(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await adminApi.deleteProduct(token, id); toast.success("Deleted"); fetchData(); }
    catch { toast.error("Failed to delete"); }
  };

  const toggleFeatured = async (p: Product) => {
    try {
      await adminApi.updateProduct(token, p.id, { is_featured: !p.is_featured });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_featured: !x.is_featured } : x));
    } catch { toast.error("Failed to update"); }
  };

  const toggleAvailability = async (p: Product) => {
    try {
      await adminApi.updateProduct(token, p.id, { is_available: !p.is_available });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_available: !x.is_available } : x));
      toast.success(p.is_available ? "Marked unavailable" : "Marked available");
    } catch { toast.error("Failed to update status"); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      const file = files[0];
      const res = await adminApi.uploadFile(token, file);
      const newUrl = res.url;
      setForm(f => ({
        ...f,
        images: f.images ? `${f.images}\n${newUrl}` : newUrl,
      }));
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === "all" || p.category_id === catFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total products</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 shadow-sm">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button onClick={openAdd} className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-gray-400" />
          <button onClick={() => setCatFilter("all")} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all", catFilter === "all" ? "bg-green-600 text-white border-green-600" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300")}>All</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCatFilter(c.id)} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all", catFilter === c.id ? "bg-green-600 text-white border-green-600" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300")}>{c.name}</button>
          ))}
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-5 space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-14 rounded-xl skeleton" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{search || catFilter !== "all" ? "No products match your filters." : "No products yet."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Product</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Category</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Price</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Featured</th>
                  <th className="text-right px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            : <Package className="w-5 h-5 text-gray-400" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">{p.name}</p>
                          {p.brand && <p className="text-xs text-gray-400">{p.brand}{p.model && ` · ${p.model}`}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-gray-500">{p.category?.name || <span className="text-gray-300">—</span>}</span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="font-medium text-gray-800">
                        {p.price != null ? `PKR ${p.price.toLocaleString()}` : <span className="text-gray-300">—</span>}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleAvailability(p)}
                        className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105", p.is_available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
                        title="Click to toggle availability"
                      >
                        {p.is_available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <button onClick={() => toggleFeatured(p)} className={cn("flex items-center gap-1 text-xs font-semibold transition-colors", p.is_featured ? "text-yellow-600" : "text-gray-300 hover:text-yellow-400")}>
                        <Star className={cn("w-4 h-4", p.is_featured && "fill-yellow-400")} />
                        {p.is_featured ? "Featured" : "—"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h2 className="font-bold text-navy-900 font-heading text-lg">{modal === "add" ? "Add Product" : "Edit Product"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Basic */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Canadian Solar 550W Panel" />
                </div>
                <div>
                  <label className="form-label">Slug *</label>
                  <input className="form-input font-mono text-sm" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="canadian-solar-550w" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Brand</label>
                  <input className="form-input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Canadian Solar" />
                </div>
                <div>
                  <label className="form-label">Model</label>
                  <input className="form-input" value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="CS6R-550T" />
                </div>
                <div>
                  <label className="form-label">Price (PKR)</label>
                  <input type="number" className="form-input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0" min={0} />
                </div>
              </div>
              <div>
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Full product description…" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label flex items-center gap-2 mb-0">
                    <ImageIcon className="w-4 h-4 text-gray-400" /> Images
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors font-medium">
                    {uploadingImage ? (
                      <span className="w-3.5 h-3.5 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    {uploadingImage ? "Uploading…" : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <textarea
                  className="form-input resize-none font-mono text-sm"
                  rows={3}
                  value={form.images}
                  onChange={e => setForm({...form, images: e.target.value})}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                />
                <p className="text-[11px] text-gray-400 mt-1">One image URL per line, or click &quot;Upload Image&quot; to upload directly.</p>
              </div>
              {/* SEO */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">SEO (optional)</p>
                <div>
                  <label className="form-label">SEO Title</label>
                  <input className="form-input" value={form.seo_title} onChange={e => setForm({...form, seo_title: e.target.value})} placeholder="Buy Canadian Solar 550W Panels in Lahore" />
                </div>
                <div>
                  <label className="form-label">SEO Description</label>
                  <textarea className="form-input resize-none" rows={2} value={form.seo_description} onChange={e => setForm({...form, seo_description: e.target.value})} placeholder="150-160 character description…" />
                </div>
              </div>
              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} className="w-4 h-4 accent-green-600" />
                  <span className="font-medium text-gray-700">Available for sale</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="w-4 h-4 accent-yellow-500" />
                  <span className="font-medium text-gray-700">Featured product</span>
                </label>
              </div>
            </div>
            <div className="p-5 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setModal(null)} className="btn-secondary py-2 px-5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Product</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
