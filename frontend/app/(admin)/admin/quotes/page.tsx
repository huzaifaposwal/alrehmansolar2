"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText, Search, Phone, MapPin, Calendar, Eye, Trash2,
  ChevronLeft, ChevronRight, RefreshCw, ArrowRightLeft,
  X, Save, DollarSign, Zap
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import type { QuoteRequest, QuoteStatus } from "@/types";
import { formatDate, cn, formatPKR } from "@/lib/utils";

const STATUS_OPTIONS: { value: QuoteStatus | "all"; label: string; color: string }[] = [
  { value: "all",         label: "All",          color: "bg-gray-100 text-gray-700" },
  { value: "new",         label: "New",          color: "bg-blue-100 text-blue-700" },
  { value: "reviewing",   label: "Reviewing",    color: "bg-purple-100 text-purple-700" },
  { value: "contacted",   label: "Contacted",    color: "bg-yellow-100 text-yellow-700" },
  { value: "quote_sent",  label: "Quote Sent",   color: "bg-orange-100 text-orange-700" },
  { value: "converted",   label: "Converted",    color: "bg-green-100 text-green-700" },
  { value: "closed",      label: "Closed",       color: "bg-gray-200 text-gray-600" },
];

const STATUS_COLOR: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.filter(s => s.value !== "all").map(s => [s.value, s.color])
);

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [selected, setSelected] = useState<QuoteRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState<QuoteStatus>("new");
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);

  const PAGE_SIZE = 20;
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const data = await adminApi.getQuotes(token, params);
      setQuotes(data?.items || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.total_pages || 1);
    } catch {
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, search]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const openDetail = (q: QuoteRequest) => {
    setSelected(q);
    setNotes(q.notes || "");
    setNewStatus(q.status);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApi.updateQuote(token, selected.id, { status: newStatus, notes });
      toast.success("Quote updated");
      setSelected(null);
      fetchQuotes();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async (id: string) => {
    setConverting(id);
    try {
      await adminApi.convertQuoteToLead(token, id);
      toast.success("Quote converted to lead!");
      setSelected(null);
      fetchQuotes();
    } catch (e: any) {
      toast.error(e.message || "Conversion failed");
    } finally {
      setConverting(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quote request?")) return;
    try {
      await adminApi.deleteQuote(token, id);
      toast.success("Quote deleted");
      fetchQuotes();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Quote Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage solar quote requests from your website ({total} total)</p>
        </div>
        <button onClick={fetchQuotes} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, email…"
            className="form-input pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                statusFilter === opt.value
                  ? `${opt.color} ring-2 ring-offset-1 ring-gray-300`
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array(8).fill(0).map((_, i) => <div key={i} className="h-14 rounded-xl skeleton" />)}
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No quote requests found</p>
            <p className="text-xs mt-1">Quote requests will appear when visitors use the solar calculator or quote form.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Customer</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Phone</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">System</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Monthly Bill</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-navy-900">{q.full_name}</div>
                      {q.city && <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{q.city}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{q.phone}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell capitalize">
                      {q.preferred_system?.replace("_", " ") || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 hidden lg:table-cell">
                      {q.monthly_bill ? formatPKR(q.monthly_bill) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[q.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_OPTIONS.find(s => s.value === q.status)?.label || q.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(q.created_at)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openDetail(q)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        {!q.lead_id && (
                          <button
                            onClick={() => handleConvert(q.id)}
                            disabled={converting === q.id}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Convert to Lead"
                          >
                            <ArrowRightLeft className={cn("w-4 h-4", converting === q.id && "animate-spin")} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages} ({total} total)</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-navy-900 font-heading">Quote Details</h3>
                <p className="text-xs text-gray-400 mt-0.5">ID: {selected.id.slice(0, 8)}…</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Name</p>
                  <p className="text-sm font-medium text-navy-900">{selected.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-sm text-gray-700">{selected.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm text-gray-700">{selected.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">City</p>
                  <p className="text-sm text-gray-700">{selected.city || "—"}</p>
                </div>
              </div>

              {/* Quote Data */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Monthly Bill</p>
                  <p className="text-sm font-semibold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-green-600" />
                    {selected.monthly_bill ? formatPKR(selected.monthly_bill) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Monthly Units</p>
                  <p className="text-sm font-semibold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-600" />
                    {selected.monthly_units ? `${selected.monthly_units} kWh` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Preferred System</p>
                  <p className="text-sm font-semibold capitalize">{selected.preferred_system?.replace("_", " ") || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Roof Size</p>
                  <p className="text-sm font-semibold">{selected.roof_size ? `${selected.roof_size} sqft` : "—"}</p>
                </div>
              </div>

              {selected.message && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{selected.message}</p>
                </div>
              )}

              {/* Status + Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                <select
                  className="form-input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as QuoteStatus)}
                >
                  {STATUS_OPTIONS.filter(s => s.value !== "all").map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Internal Notes</label>
                <textarea
                  className="form-input min-h-[80px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this quote…"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleUpdate} disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Update</>}
                </button>
                {!selected.lead_id && (
                  <button
                    onClick={() => handleConvert(selected.id)}
                    disabled={converting === selected.id}
                    className="btn-secondary flex-1 justify-center"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Convert to Lead
                  </button>
                )}
                {selected.lead_id && (
                  <span className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-xl font-medium">
                    ✓ Converted to Lead
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
