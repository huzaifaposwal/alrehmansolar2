"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, Users, Clock, Filter,
  Trash2, Pencil, Plus, LogIn
} from "lucide-react";
import { adminApi } from "@/lib/api";
import type { ActivityLogEntry } from "@/types";
import { formatDate, cn } from "@/lib/utils";

const ACTION_MAP: Record<string, { icon: typeof Activity; color: string; bg: string }> = {
  created: { icon: Plus, color: "text-green-600", bg: "bg-green-50" },
  updated: { icon: Pencil, color: "text-blue-600", bg: "bg-blue-50" },
  deleted: { icon: Trash2, color: "text-red-600", bg: "bg-red-50" },
  login:   { icon: LogIn, color: "text-purple-600", bg: "bg-purple-50" },
  default: { icon: Clock, color: "text-gray-500", bg: "bg-gray-50" },
};

export default function AdminActivityPage() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const PAGE_SIZE = 30;
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE };
      if (entityFilter) params.entity = entityFilter;
      if (actionFilter) params.action = actionFilter;
      const data = await adminApi.getActivity(token, params);
      setEntries(data?.items || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.total_pages || 1);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token, page, entityFilter, actionFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Activity Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track all admin actions and changes ({total} entries)</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="form-input !py-2 !text-xs max-w-[150px]"
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Entities</option>
            <option value="product">Products</option>
            <option value="project">Projects</option>
            <option value="blog_post">Blog Posts</option>
            <option value="lead">Leads</option>
            <option value="quote">Quotes</option>
            <option value="testimonial">Testimonials</option>
            <option value="faq">FAQs</option>
            <option value="setting">Settings</option>
            <option value="user">Users</option>
          </select>
        </div>
        <select
          className="form-input !py-2 !text-xs max-w-[130px]"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="login">Login</option>
        </select>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array(10).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl skeleton" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No activity recorded yet</p>
            <p className="text-xs mt-1">Admin actions will be tracked here automatically.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {entries.map((entry) => {
              const actionStyle = ACTION_MAP[entry.action] || ACTION_MAP.default;
              const Icon = actionStyle.icon;
              return (
                <div key={entry.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", actionStyle.bg)}>
                    <Icon className={cn("w-4.5 h-4.5", actionStyle.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-navy-900">
                        {entry.user_email || "System"}
                      </span>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        entry.action === "created" && "bg-green-100 text-green-700",
                        entry.action === "updated" && "bg-blue-100 text-blue-700",
                        entry.action === "deleted" && "bg-red-100 text-red-700",
                        entry.action === "login" && "bg-purple-100 text-purple-700",
                        !["created", "updated", "deleted", "login"].includes(entry.action) && "bg-gray-100 text-gray-600"
                      )}>
                        {entry.action}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">{entry.entity}</span>
                    </div>
                    {entry.details && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{entry.details}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                  {entry.entity_id && (
                    <code className="text-[10px] text-gray-300 bg-gray-50 px-2 py-1 rounded-lg font-mono flex-shrink-0 hidden sm:block">
                      {entry.entity_id.slice(0, 8)}…
                    </code>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
