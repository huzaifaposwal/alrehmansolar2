"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users, Plus, Search, Filter, Phone, MapPin, Calendar,
  Eye, Trash2, ChevronLeft, ChevronRight, X, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import type { Lead, LeadStatus } from "@/types";
import { formatDate, cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: LeadStatus | "all"; label: string; color: string }[] = [
  { value: "all",           label: "All",           color: "bg-gray-100 text-gray-700" },
  { value: "new",           label: "New",           color: "bg-blue-100 text-blue-700" },
  { value: "contacted",     label: "Contacted",     color: "bg-yellow-100 text-yellow-700" },
  { value: "follow_up",     label: "Follow Up",     color: "bg-indigo-100 text-indigo-700" },
  { value: "qualified",     label: "Qualified",     color: "bg-purple-100 text-purple-700" },
  { value: "quoted",        label: "Quoted",        color: "bg-cyan-100 text-cyan-700" },
  { value: "proposal_sent", label: "Proposal Sent", color: "bg-orange-100 text-orange-700" },
  { value: "converted",     label: "Converted",     color: "bg-emerald-100 text-emerald-700" },
  { value: "won",           label: "Won",           color: "bg-green-100 text-green-700" },
  { value: "lost",          label: "Lost",          color: "bg-red-100 text-red-700" },
  { value: "closed",        label: "Closed",        color: "bg-slate-100 text-slate-700" },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const PAGE_SIZE = 20;
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const data = await adminApi.getLeads(token, params);
      setLeads(data?.items || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.total_pages || 1);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete lead for "${name}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteLead(token, id);
      toast.success("Lead deleted");
      fetchLeads();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    try {
      await adminApi.updateLead(token, id, { status: newStatus });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const statusInfo = (s: LeadStatus) =>
    STATUS_OPTIONS.find(o => o.value === s) || STATUS_OPTIONS[0];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total lead{total !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone, city…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {STATUS_OPTIONS.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value as LeadStatus | "all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                statusFilter === value
                  ? `${color} border-current shadow-sm scale-105`
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array(6).fill(0).map((_, i) => <div key={i} className="h-14 rounded-xl skeleton" />)}
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              {search || statusFilter !== "all" ? "No leads match your filters." : "No leads yet."}
            </p>
            {(search || statusFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("all"); }}
                className="mt-2 text-sm text-green-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Customer</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Contact</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Location</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">System</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden xl:table-cell">Date</th>
                  <th className="text-right px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(lead => {
                  const s = statusInfo(lead.status);
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-navy-900">{lead.full_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{lead.property_type || "—"}</p>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <p className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <a href={`tel:${lead.phone}`} className="hover:text-green-600 transition-colors">{lead.phone}</a>
                        </p>
                        {lead.email && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">{lead.email}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {lead.city ? (
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400" />{lead.city}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-gray-600 capitalize">{lead.preferred_system?.replace(/_/g, " ") || "—"}</p>
                        {lead.monthly_bill && (
                          <p className="text-xs text-gray-400">PKR {lead.monthly_bill.toLocaleString()}/mo</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={lead.status}
                          onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-green-500/20 ${s.color}`}
                        >
                          {STATUS_OPTIONS.filter(o => o.value !== "all").map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-white text-gray-800">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 hidden xl:table-cell">
                        <span className="flex items-center gap-1.5 text-gray-400 text-xs whitespace-nowrap">
                          <Calendar className="w-3 h-3" />{formatDate(lead.created_at)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(lead.id, lead.full_name)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                            title="Delete lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return pg <= totalPages ? (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={cn(
                      "w-9 h-9 rounded-xl text-sm font-medium transition-colors",
                      pg === page
                        ? "bg-green-600 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {pg}
                  </button>
                ) : null;
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
