import {
  getBlogPostsFromData,
  getBlogPostBySlug,
  getBlogCategoriesFromData,
} from "@/lib/blog-data";

// Centralized API configuration and client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_V1 = `${API_BASE}/api/v1`;

// ─── Generic Fetch Helper ──────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_V1}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `API error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const api = {
  // Settings
  getSettings: () => apiFetch<any[]>("/settings"),
  getSetting: (key: string) => apiFetch<any>(`/settings/${key}`),

  // Products
  getProducts: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return apiFetch<any>(`/products${q ? `?${q}` : ""}`);
  },
  getProduct: (slug: string) => apiFetch<any>(`/products/${slug}`),
  getProductCategories: () => apiFetch<any[]>("/products/categories"),

  // Projects
  getProjects: (params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return apiFetch<any>(`/projects${q ? `?${q}` : ""}`);
  },
  getProject: (slug: string) => apiFetch<any>(`/projects/${slug}`),

  // Blog
  getBlogPosts: async (params?: Record<string, any>) => {
    try {
      const q = new URLSearchParams(params as any).toString();
      const res = await apiFetch<any>(`/blog${q ? `?${q}` : ""}`);
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        return res;
      }
    } catch {
      // Backend unavailable; serve rich static blog data
    }
    return getBlogPostsFromData(params);
  },
  getBlogPost: async (slug: string) => {
    try {
      const res = await apiFetch<any>(`/blog/${slug}`);
      if (res && res.slug) {
        return res;
      }
    } catch {
      // Backend unavailable; serve rich static blog data
    }
    return getBlogPostBySlug(slug);
  },
  getBlogCategories: async () => {
    try {
      const res = await apiFetch<any[]>("/blog/categories");
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
    } catch {
      // Backend unavailable; serve rich static blog categories
    }
    return getBlogCategoriesFromData();
  },

  // FAQs
  getFAQs: (category?: string) => {
    const q = category ? `?category=${category}` : "";
    return apiFetch<any[]>(`/faqs${q}`);
  },

  // Testimonials
  getTestimonials: () => apiFetch<any[]>("/testimonials"),

  // Calculator
  calculate: (data: any) =>
    apiFetch<any>("/calculator/calculate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Lead / Quote submission
  submitLead: (data: any) =>
    apiFetch<any>("/leads", { method: "POST", body: JSON.stringify(data) }),

  submitQuote: (data: any) =>
    apiFetch<any>("/quotes", { method: "POST", body: JSON.stringify(data) }),

  // Contact
  submitContact: (data: any) =>
    apiFetch<any>("/contact", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Admin API (requires JWT token) ──────────────────────────────────────────

export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: (token: string) => apiFetch<any>("/auth/me", {}, token),

  // Dashboard stats
  getStats: (token: string) =>
    apiFetch<any>("/settings/dashboard/stats", {}, token),

  // Leads
  getLeads: (token: string, params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return apiFetch<any>(`/leads${q ? `?${q}` : ""}`, {}, token);
  },
  getLead: (token: string, id: string) =>
    apiFetch<any>(`/leads/${id}`, {}, token),
  updateLead: (token: string, id: string, data: any) =>
    apiFetch<any>(`/leads/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),
  deleteLead: (token: string, id: string) =>
    apiFetch<void>(`/leads/${id}`, { method: "DELETE" }, token),

  // Products
  getAdminProducts: (token: string, params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return apiFetch<any>(`/products${q ? `?${q}` : ""}`, {}, token);
  },
  getAdminProductCategories: (token: string) =>
    apiFetch<any[]>("/products/categories", {}, token),
  createProduct: (token: string, data: any) =>
    apiFetch<any>("/products", { method: "POST", body: JSON.stringify(data) }, token),
  updateProduct: (token: string, id: string, data: any) =>
    apiFetch<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),
  deleteProduct: (token: string, id: string) =>
    apiFetch<void>(`/products/${id}`, { method: "DELETE" }, token),

  // Projects
  getAdminProjects: (token: string, params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return apiFetch<any>(`/projects${q ? `?${q}` : ""}`, {}, token);
  },
  createProject: (token: string, data: any) =>
    apiFetch<any>("/projects", { method: "POST", body: JSON.stringify(data) }, token),
  updateProject: (token: string, id: string, data: any) =>
    apiFetch<any>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),
  deleteProject: (token: string, id: string) =>
    apiFetch<void>(`/projects/${id}`, { method: "DELETE" }, token),

  // Blog
  getAdminPosts: (token: string, params?: Record<string, any>) => {
    const q = new URLSearchParams({ published_only: "false", ...(params as any) }).toString();
    return apiFetch<any>(`/blog/posts?${q}`, {}, token);
  },
  getAdminBlogCategories: (token: string) =>
    apiFetch<any[]>("/blog/categories", {}, token),
  createPost: (token: string, data: any) =>
    apiFetch<any>("/blog", { method: "POST", body: JSON.stringify(data) }, token),
  updatePost: (token: string, id: string, data: any) =>
    apiFetch<any>(`/blog/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),
  deletePost: (token: string, id: string) =>
    apiFetch<void>(`/blog/${id}`, { method: "DELETE" }, token),
  getAllPosts: (token: string) =>
    apiFetch<any>("/blog?published_only=false", {}, token),

  // Testimonials
  createTestimonial: (token: string, data: any) =>
    apiFetch<any>("/testimonials", { method: "POST", body: JSON.stringify(data) }, token),
  updateTestimonial: (token: string, id: string, data: any) =>
    apiFetch<any>(`/testimonials/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),
  deleteTestimonial: (token: string, id: string) =>
    apiFetch<void>(`/testimonials/${id}`, { method: "DELETE" }, token),
  getAllTestimonials: (token: string) =>
    apiFetch<any[]>("/testimonials?published_only=false", {}, token),

  // FAQs
  createFAQ: (token: string, data: any) =>
    apiFetch<any>("/faqs", { method: "POST", body: JSON.stringify(data) }, token),
  updateFAQ: (token: string, id: string, data: any) =>
    apiFetch<any>(`/faqs/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),
  deleteFAQ: (token: string, id: string) =>
    apiFetch<void>(`/faqs/${id}`, { method: "DELETE" }, token),
  getAllFAQs: (token: string) =>
    apiFetch<any[]>("/faqs?published_only=false", {}, token),

  // Settings
  updateSetting: (token: string, key: string, value: string) =>
    apiFetch<any>(`/settings/${key}`, { method: "PUT", body: JSON.stringify({ value }) }, token),
  bulkUpdateSettings: (token: string, settings: Record<string, string>) =>
    apiFetch<any>("/settings/bulk", { method: "POST", body: JSON.stringify({ settings }) }, token),

  // Messages
  getMessages: (token: string) => apiFetch<any[]>("/contact", {}, token),
  markMessageRead: (token: string, id: string) =>
    apiFetch<any>(`/contact/${id}/read`, { method: "PUT" }, token),

  // ─── Quotes ──────────────────────────────────────────────────────────────
  getQuotes: (token: string, params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return apiFetch<any>(`/quotes${q ? `?${q}` : ""}`, {}, token);
  },
  getQuote: (token: string, id: string) =>
    apiFetch<any>(`/quotes/${id}`, {}, token),
  updateQuote: (token: string, id: string, data: any) =>
    apiFetch<any>(`/quotes/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),
  deleteQuote: (token: string, id: string) =>
    apiFetch<void>(`/quotes/${id}`, { method: "DELETE" }, token),
  convertQuoteToLead: (token: string, id: string) =>
    apiFetch<any>(`/quotes/${id}/convert-to-lead`, { method: "POST" }, token),

  // ─── Activity Log ─────────────────────────────────────────────────────────
  getActivity: (token: string, params?: Record<string, any>) => {
    const q = new URLSearchParams(params as any).toString();
    return apiFetch<any>(`/activity${q ? `?${q}` : ""}`, {}, token);
  },
  getRecentActivity: (token: string, limit = 10) =>
    apiFetch<any>(`/settings/dashboard/recent-activity?limit=${limit}`, {}, token),

  // ─── Dashboard Charts ──────────────────────────────────────────────────────
  getLeadStats: (token: string) =>
    apiFetch<any>("/settings/dashboard/lead-stats", {}, token),

  // ─── File Upload ──────────────────────────────────────────────────────────
  uploadFile: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_V1}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },

  // ─── User Management ────────────────────────────────────────────────────
  getUsers: (token: string) =>
    apiFetch<any[]>("/auth/users", {}, token),
  createUser: (token: string, data: any) =>
    apiFetch<any>("/auth/users", { method: "POST", body: JSON.stringify(data) }, token),
  updateUser: (token: string, id: string, data: any) =>
    apiFetch<any>(`/auth/users/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),
  deleteUser: (token: string, id: string) =>
    apiFetch<void>(`/auth/users/${id}`, { method: "DELETE" }, token),
  changePassword: (token: string, data: { current_password: string; new_password: string }) =>
    apiFetch<any>("/auth/change-password", { method: "POST", body: JSON.stringify(data) }, token),
};

export default api;
