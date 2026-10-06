"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FolderOpen, Plus, Pencil, Trash2, X, Save, RefreshCw,
  MapPin, Zap, Calendar, Image as ImageIcon, Star, Globe, EyeOff, Upload
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { slugify, cn, formatDate } from "@/lib/utils";
import type { Project } from "@/types";

type FormState = {
  title: string; slug: string; location: string; capacity_kw: string;
  project_type: string; system_type: string; completion_date: string;
  description: string; components: string; results: string;
  images: string; is_featured: boolean; is_published: boolean;
  seo_title: string; seo_description: string;
};

const EMPTY_FORM: FormState = {
  title: "", slug: "", location: "", capacity_kw: "",
  project_type: "residential", system_type: "hybrid",
  completion_date: "", description: "", components: "", results: "",
  images: "", is_featured: false, is_published: true,
  seo_title: "", seo_description: "",
};

const PROJECT_TYPES = ["residential", "commercial", "industrial", "agricultural"];
const SYSTEM_TYPES = ["on_grid", "off_grid", "hybrid"];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editItem, setEditItem] = useState<Project | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAdminProjects(token, { page_size: 100 });
      setProjects(data?.items || []);
      setTotal(data?.total || 0);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: f.slug || slugify(title) }));
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setModal("add"); };
  const openEdit = (p: Project) => {
    setForm({
      title: p.title, slug: p.slug, location: p.location || "",
      capacity_kw: p.capacity_kw != null ? String(p.capacity_kw) : "",
      project_type: p.project_type || "residential",
      system_type: p.system_type || "hybrid",
      completion_date: p.completion_date ? p.completion_date.split("T")[0] : "",
      description: p.description || "", components: (p.components || []).join("\n"),
      results: p.results || "",
      images: (p.images || []).map(img => img.url).join("\n"),
      is_featured: p.is_featured,
      is_published: p.is_published ?? true,
      seo_title: p.seo_title || "", seo_description: p.seo_description || "",
    });
    setEditItem(p);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast.error("Title and slug required"); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title, slug: form.slug.trim().toLowerCase(),
        location: form.location || null,
        capacity_kw: form.capacity_kw ? parseFloat(form.capacity_kw) : null,
        project_type: form.project_type || null,
        system_type: form.system_type || null,
        completion_date: form.completion_date ? new Date(form.completion_date).toISOString() : null,
        description: form.description || null,
        components: form.components ? form.components.split("\n").map(s => s.trim()).filter(Boolean) : [],
        results: form.results || null,
        is_featured: form.is_featured, is_published: form.is_published,
        seo_title: form.seo_title || null, seo_description: form.seo_description || null,
      };
      if (modal === "add") await adminApi.createProject(token, payload);
      else if (editItem) await adminApi.updateProject(token, editItem.id, payload);
      toast.success(modal === "add" ? "Project created!" : "Project updated!");
      setModal(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete project "${title}"?`)) return;
    try { await adminApi.deleteProject(token, id); toast.success("Deleted"); fetchData(); }
    catch { toast.error("Failed to delete"); }
  };

  const togglePublish = async (p: Project) => {
    try {
      await adminApi.updateProject(token, p.id, { is_published: !p.is_published });
      setProjects(prev => prev.map(x => x.id === p.id ? { ...x, is_published: !x.is_published } : x));
      toast.success(p.is_published ? "Project set to draft" : "Project published!");
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

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Projects / Portfolio</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} projects</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 shadow-sm">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button onClick={openAdd} className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="h-48 rounded-2xl skeleton" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No projects yet. Add your first project to showcase your work.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => {
            const primaryImg = p.images?.find(img => img.is_primary) || p.images?.[0];
            return (
              <div key={p.id} className={cn("bg-white rounded-2xl border overflow-hidden group hover:shadow-lg transition-all", p.is_published ?? true ? "border-gray-100" : "border-dashed border-gray-200 opacity-75")}>
                <div className="h-36 bg-gray-100 relative overflow-hidden">
                  {primaryImg ? (
                    <img src={primaryImg.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="flex items-center justify-center h-full"><FolderOpen className="w-10 h-10 text-gray-300" /></div>
                  )}
                  {p.is_featured && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Featured
                    </div>
                  )}
                  <button
                    onClick={() => togglePublish(p)}
                    className="absolute top-2 right-2 cursor-pointer transition-transform hover:scale-105"
                    title="Click to toggle status"
                  >
                    {p.is_published
                      ? <span className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Live</span>
                      : <span className="bg-gray-400 hover:bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Draft</span>
                    }
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-navy-900 text-sm line-clamp-1">{p.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                    {p.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>}
                    {p.capacity_kw && <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" />{p.capacity_kw} kW</span>}
                    {p.system_type && <span className="capitalize">{p.system_type.replace(/_/g, " ")}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 capitalize">{p.project_type || "—"}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.title)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h2 className="font-bold text-navy-900 font-heading text-lg">{modal === "add" ? "Add Project" : "Edit Project"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Basic info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Project Title *</label>
                  <input className="form-input" value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. 10kW Hybrid Solar – Gulberg" />
                </div>
                <div>
                  <label className="form-label">Slug *</label>
                  <input className="form-input font-mono text-sm" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label"><MapPin className="inline w-3.5 h-3.5 mr-1" />Location</label>
                  <input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Gulberg, Lahore" />
                </div>
                <div>
                  <label className="form-label"><Zap className="inline w-3.5 h-3.5 mr-1" />Capacity (kW)</label>
                  <input type="number" className="form-input" value={form.capacity_kw} onChange={e => setForm({...form, capacity_kw: e.target.value})} placeholder="10" step="0.5" min={0} />
                </div>
                <div>
                  <label className="form-label"><Calendar className="inline w-3.5 h-3.5 mr-1" />Completion Date</label>
                  <input type="date" className="form-input" value={form.completion_date} onChange={e => setForm({...form, completion_date: e.target.value})} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Project Type</label>
                  <select className="form-select" value={form.project_type} onChange={e => setForm({...form, project_type: e.target.value})}>
                    {PROJECT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">System Type</label>
                  <select className="form-select" value={form.system_type} onChange={e => setForm({...form, system_type: e.target.value})}>
                    {SYSTEM_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Project overview…" />
              </div>
              <div>
                <label className="form-label">Components Installed (one per line)</label>
                <textarea className="form-input resize-none" rows={3} value={form.components} onChange={e => setForm({...form, components: e.target.value})} placeholder="10x Canadian Solar 400W Panels&#10;5kW Inverter&#10;200Ah Battery Bank" />
              </div>
              <div>
                <label className="form-label">Results / Outcomes</label>
                <textarea className="form-input resize-none" rows={2} value={form.results} onChange={e => setForm({...form, results: e.target.value})} placeholder="70% reduction in electricity bills…" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label flex items-center gap-1.5 mb-0">
                    <ImageIcon className="w-3.5 h-3.5 text-gray-400" /> Images
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
                  placeholder="https://…/photo1.jpg&#10;https://…/photo2.jpg"
                />
                <p className="text-[11px] text-gray-400 mt-1">One image URL per line, or click &quot;Upload Image&quot; to upload directly.</p>
              </div>
              {/* SEO */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">SEO Settings</p>
                <div>
                  <label className="form-label">SEO Title</label>
                  <input className="form-input" value={form.seo_title} onChange={e => setForm({...form, seo_title: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">SEO Description</label>
                  <textarea className="form-input resize-none" rows={2} value={form.seo_description} onChange={e => setForm({...form, seo_description: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} className="w-4 h-4 accent-green-600" />
                  <Globe className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-700">Published (visible on site)</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="w-4 h-4 accent-yellow-500" />
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-gray-700">Featured</span>
                </label>
              </div>
            </div>
            <div className="p-5 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setModal(null)} className="btn-secondary py-2 px-5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Project</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
