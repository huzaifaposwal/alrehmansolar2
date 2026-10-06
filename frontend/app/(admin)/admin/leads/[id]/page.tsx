"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, MessageSquare,
  Save, Trash2, ExternalLink, User, Home, Zap, RefreshCw, Clock
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import type { Lead } from "@/types";
import { formatDate, cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "new",           label: "New",           color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "contacted",     label: "Contacted",     color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "follow_up",     label: "Follow Up",     color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "qualified",     label: "Qualified",     color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "quoted",        label: "Quoted",        color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { value: "proposal_sent", label: "Proposal Sent", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "converted",     label: "Converted",     color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "won",           label: "Won",           color: "bg-green-100 text-green-700 border-green-200" },
  { value: "lost",          label: "Lost",          color: "bg-red-100 text-red-700 border-red-200" },
  { value: "closed",        label: "Closed",        color: "bg-slate-100 text-slate-700 border-slate-200" },
];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchLead = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getLead(token, id);
      setLead(data);
      setNotes(data.notes || "");
    } catch {
      toast.error("Failed to load lead");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  const updateStatus = async (status: string) => {
    setUpdatingStatus(true);
    try {
      await adminApi.updateLead(token, id, { status });
      setLead(prev => prev ? { ...prev, status: status as any } : prev);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await adminApi.updateLead(token, id, { notes });
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const deleteLead = async () => {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    try {
      await adminApi.deleteLead(token, id);
      toast.success("Lead deleted");
      router.push("/admin/leads");
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  const whatsappLink = lead?.phone
    ? `https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${lead.full_name}, I'm reaching out regarding your solar inquiry.`)}`
    : "#";

  const phoneLink = lead?.phone ? `tel:${lead.phone}` : "#";
  const emailLink = lead?.email ? `mailto:${lead.email}?subject=Solar Inquiry Follow-up&body=Dear ${lead?.full_name},` : "#";

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded-xl skeleton" />
        <div className="h-64 rounded-2xl skeleton" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Lead not found.</p>
        <Link href="/admin/leads" className="text-green-600 hover:underline mt-2 inline-block">← Back to leads</Link>
      </div>
    );
  }

  const currentStatus = STATUS_OPTIONS.find(s => s.value === lead.status);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/leads" className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-900 font-heading">{lead.full_name}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5" /> Received {formatDate(lead.created_at)}
              <span className="text-gray-300">·</span> Source: <span className="capitalize">{lead.source}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLead} className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={deleteLead} className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              <a
                href={phoneLink}
                className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-green-700">Call</span>
                <span className="text-[10px] text-green-600">{lead.phone}</span>
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-emerald-700">WhatsApp</span>
                <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">Open <ExternalLink className="w-2.5 h-2.5" /></span>
              </a>
              <a
                href={emailLink}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl transition-colors",
                  lead.email ? "bg-blue-50 hover:bg-blue-100" : "bg-gray-50 opacity-50 cursor-not-allowed"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", lead.email ? "bg-blue-600" : "bg-gray-400")}>
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className={cn("text-xs font-medium", lead.email ? "text-blue-700" : "text-gray-500")}>Email</span>
                <span className="text-[10px] text-blue-600 truncate max-w-full px-1">{lead.email || "No email"}</span>
              </a>
            </div>
          </div>

          {/* Lead Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Lead Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: "Full Name", value: lead.full_name },
                { icon: Phone, label: "Phone", value: lead.phone },
                { icon: Mail, label: "Email", value: lead.email },
                { icon: MapPin, label: "City", value: lead.city },
                { icon: Home, label: "Property Type", value: lead.property_type ? lead.property_type.charAt(0).toUpperCase() + lead.property_type.slice(1) : null },
                { icon: Zap, label: "Preferred System", value: lead.preferred_system ? lead.preferred_system.replace(/_/g, " ").toUpperCase() : null },
                { icon: Zap, label: "Monthly Bill", value: lead.monthly_bill ? `PKR ${lead.monthly_bill.toLocaleString()}` : null },
                { icon: Zap, label: "Monthly Units", value: lead.monthly_units ? `${lead.monthly_units} kWh` : null },
                { icon: Home, label: "Roof Size", value: lead.roof_size ? `${lead.roof_size} sqft` : null },
              ].filter(f => f.value).map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {lead.message && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Customer Message
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{lead.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Status + Notes */}
        <div className="space-y-5">
          {/* Current Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Lead Status</h2>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => updateStatus(value)}
                  disabled={updatingStatus}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    lead.status === value
                      ? `${color} shadow-sm`
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {label}
                  {lead.status === value && (
                    <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Internal Notes</h2>
            <textarea
              rows={5}
              className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none transition-all"
              placeholder="Add private notes about this lead…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {savingNotes ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Notes
            </button>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">Created</p>
            <p className="text-sm font-medium text-gray-700">{new Date(lead.created_at).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mb-1 mt-3">Last Updated</p>
            <p className="text-sm font-medium text-gray-700">{new Date(lead.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
