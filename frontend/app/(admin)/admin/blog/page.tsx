"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpen, Plus, Pencil, Trash2, X, Save, Search, RefreshCw,
  Globe, EyeOff, Tag, Clock, Calendar, Upload, Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { slugify, cn, formatDate } from "@/lib/utils";
import type { BlogPost, BlogCategory } from "@/types";

type FormState = {
  title: string; slug: string; excerpt: string; content: string;
  author: string; category_id: string; tags: string; featured_image: string;
  is_published: boolean; read_time_minutes: string;
  seo_title: string; seo_description: string;
};

const EMPTY_FORM: FormState = {
  title: "", slug: "", excerpt: "", content: "", author: "Al Rehman Solar Team",
  category_id: "", tags: "", featured_image: "", is_published: false,
  read_time_minutes: "", seo_title: "", seo_description: "",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editItem, setEditItem] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [uploadingImage, setUploadingImage] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const [postsRes, catsData] = await Promise.all([
        fetch(`${API}/api/v1/blog/posts?published_only=false&page_size=100`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        adminApi.getAdminBlogCategories(token).catch(() => []),
      ]);
      setPosts(postsRes?.items || []);
      setCategories(catsData || []);
    } catch {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: f.slug || slugify(title) }));
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setModal("add"); };
  const openEdit = (p: BlogPost) => {
    setForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt || "",
      content: p.content || "", author: p.author || "",
      category_id: p.category_id || "", tags: (p.tags || []).join(", "),
      featured_image: p.featured_image || "", is_published: p.is_published,
      read_time_minutes: p.read_time_minutes ? String(p.read_time_minutes) : "",
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
        excerpt: form.excerpt || null, content: form.content || null,
        author: form.author || null, category_id: form.category_id || null,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        featured_image: form.featured_image || null,
        is_published: form.is_published,
        read_time_minutes: form.read_time_minutes ? parseInt(form.read_time_minutes) : null,
        seo_title: form.seo_title || null, seo_description: form.seo_description || null,
      };
      if (modal === "add") await adminApi.createPost(token, payload);
      else if (editItem) await adminApi.updatePost(token, editItem.id, payload);
      toast.success(modal === "add" ? "Post created!" : "Post updated!");
      setModal(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await adminApi.deletePost(token, id); toast.success("Deleted"); fetchData(); }
    catch { toast.error("Failed to delete"); }
  };

  const togglePublish = async (p: BlogPost) => {
    try {
      await adminApi.updatePost(token, p.id, { is_published: !p.is_published });
      setPosts(prev => prev.map(x => x.id === p.id ? { ...x, is_published: !x.is_published } : x));
      toast.success(p.is_published ? "Set to draft" : "Published!");
    } catch { toast.error("Failed to update"); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      const file = files[0];
      const res = await adminApi.uploadFile(token, file);
      setForm(f => ({ ...f, featured_image: res.url }));
      toast.success("Featured image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || (statusFilter === "published" ? p.is_published : !p.is_published);
    const matchCat = categoryFilter === "all" || p.category_id === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {posts.filter(p => p.is_published).length} published · {posts.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 shadow-sm">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button onClick={openAdd} className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "published", "draft"] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                statusFilter === f ? "bg-green-600 text-white border-green-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              )}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-green-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Posts table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-5 space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-14 rounded-xl skeleton" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{search || statusFilter !== "all" ? "No posts match filters." : "No blog posts yet."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Post</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Category</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Author</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="text-right px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          {p.featured_image
                            ? <img src={p.featured_image} alt={p.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-gray-400" /></div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-navy-900 truncate max-w-xs">{p.title}</p>
                          {p.excerpt && <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{p.excerpt}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {p.category ? (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{p.category.name}</span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell text-gray-500">{p.author || "—"}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => togglePublish(p)} className="flex items-center gap-1.5 text-xs font-semibold transition-colors">
                        {p.is_published
                          ? <><Globe className="w-3.5 h-3.5 text-green-600" /><span className="text-green-600">Published</span></>
                          : <><EyeOff className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-400">Draft</span></>
                        }
                      </button>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {p.published_at ? formatDate(p.published_at) : formatDate(p.created_at)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id, p.title)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h2 className="font-bold text-navy-900 font-heading text-lg">
                {modal === "add" ? "New Blog Post" : "Edit Blog Post"}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Post title…" />
                </div>
                <div>
                  <label className="form-label">Slug *</label>
                  <input className="form-input font-mono text-sm" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="my-post-slug" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Author</label>
                  <input className="form-input" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                    <option value="">No category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label"><Clock className="inline w-3.5 h-3.5 mr-1" />Read Time (min)</label>
                  <input type="number" className="form-input" value={form.read_time_minutes} onChange={e => setForm({...form, read_time_minutes: e.target.value})} placeholder="5" min={1} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label flex items-center gap-1.5 mb-0">
                    <ImageIcon className="w-3.5 h-3.5 text-gray-400" /> Featured Image
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
                <input
                  className="form-input"
                  value={form.featured_image}
                  onChange={e => setForm({...form, featured_image: e.target.value})}
                  placeholder="https://…/image.jpg"
                />
              </div>

              <div>
                <label className="form-label">Excerpt (short description)</label>
                <textarea className="form-input resize-none" rows={2} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} placeholder="Brief summary shown in blog listing…" />
              </div>

              <div>
                <label className="form-label">Content (HTML supported)</label>
                <textarea className="form-input resize-y font-mono text-sm" rows={12} value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="<p>Write your full article content here. HTML tags are supported.</p>" />
              </div>

              <div>
                <label className="form-label flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Tags (comma-separated)</label>
                <input className="form-input" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Solar Energy, Lahore, Net Metering" />
              </div>

              {/* SEO */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">SEO Settings</p>
                <div>
                  <label className="form-label">SEO Title</label>
                  <input className="form-input" value={form.seo_title} onChange={e => setForm({...form, seo_title: e.target.value})} placeholder="Keyword-rich title for search engines" />
                </div>
                <div>
                  <label className="form-label">SEO Description</label>
                  <textarea className="form-input resize-none" rows={2} value={form.seo_description} onChange={e => setForm({...form, seo_description: e.target.value})} placeholder="150–160 character description for Google…" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} className="w-4 h-4 accent-green-600" />
                <Globe className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-700">Publish immediately on website</span>
              </label>
            </div>
            <div className="p-5 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setModal(null)} className="btn-secondary py-2 px-5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> {form.is_published ? "Publish Post" : "Save Draft"}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
