"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, Package, FolderOpen, BookOpen, MessageSquare, Star,
  TrendingUp, ArrowRight, AlertCircle, Phone, MapPin,
  Calendar, RefreshCw, CheckCircle2, Zap, Activity,
  FileText, ArrowUpRight, Clock
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { adminApi } from "@/lib/api";
import type { DashboardStats, Lead, ActivityLogEntry } from "@/types";
import { formatDate, cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  follow_up: "bg-cyan-100 text-cyan-700",
  qualified: "bg-purple-100 text-purple-700",
  quoted: "bg-amber-100 text-amber-700",
  proposal_sent: "bg-orange-100 text-orange-700",
  converted: "bg-emerald-100 text-emerald-700",
  won: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  lost: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New", contacted: "Contacted", follow_up: "Follow Up",
  qualified: "Qualified", quoted: "Quoted", proposal_sent: "Proposal Sent",
  converted: "Converted", won: "Won", closed: "Closed", lost: "Lost",
};

const CHART_COLORS = [
  "#3b82f6", "#eab308", "#06b6d4", "#8b5cf6", "#f59e0b",
  "#f97316", "#10b981", "#22c55e", "#6b7280", "#ef4444",
];

const ACTION_ICONS: Record<string, typeof Users> = {
  created: CheckCircle2, updated: Activity, deleted: AlertCircle,
  login: Users, default: Clock,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [leadChartData, setLeadChartData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLeadsLoading(true);
    try {
      const [statsData, leadsData, leadStatsData, activityData] = await Promise.all([
        adminApi.getStats(token),
        adminApi.getLeads(token, { page: 1, page_size: 6 }),
        adminApi.getLeadStats(token).catch(() => ({ lead_stats: {} })),
        adminApi.getRecentActivity(token, 8).catch(() => ({ items: [] })),
      ]);
      setStats(statsData);
      setRecentLeads(leadsData?.items || []);
      setRecentActivity(activityData?.items || []);
      setBackendOnline(true);

      // Build chart data from lead stats
      const ls = leadStatsData?.lead_stats || {};
      const chartData = Object.entries(ls)
        .map(([status, count]) => ({
          name: STATUS_LABELS[status] || status,
          value: count as number,
          status,
        }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);
      setLeadChartData(chartData);
    } catch {
      setBackendOnline(false);
    } finally {
      setLoading(false);
      setLeadsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statCards = stats ? [
    { label: "New Leads", value: stats.new_leads, icon: Users, color: "blue", href: "/admin/leads?status=new", alert: stats.new_leads > 0 },
    { label: "Total Leads", value: stats.total_leads, icon: TrendingUp, color: "green", href: "/admin/leads" },
    { label: "Quote Requests", value: stats.quote_requests, icon: FileText, color: "amber", href: "/admin/quotes", alert: stats.quote_requests > 0 },
    { label: "Unread Messages", value: stats.unread_messages, icon: MessageSquare, color: "orange", href: "/admin/messages", alert: stats.unread_messages > 0 },
    { label: "Products", value: stats.total_products, icon: Package, color: "purple", href: "/admin/products" },
    { label: "Projects", value: stats.total_projects, icon: FolderOpen, color: "teal", href: "/admin/projects" },
    { label: "Blog Posts", value: stats.published_blog_posts, icon: BookOpen, color: "indigo", href: "/admin/blog" },
    { label: "Testimonials", value: stats.published_testimonials, icon: Star, color: "yellow", href: "/admin/testimonials" },
  ] : [];

  const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   ring: "ring-blue-100" },
    green:  { bg: "bg-green-50",  text: "text-green-600",  ring: "ring-green-100" },
    amber:  { bg: "bg-amber-50",  text: "text-amber-600",  ring: "ring-amber-100" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", ring: "ring-orange-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-100" },
    teal:   { bg: "bg-teal-50",   text: "text-teal-600",   ring: "ring-teal-100" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-600", ring: "ring-yellow-100" },
  };

  const quickActions = [
    { label: "Add Product", href: "/admin/products", icon: Package, color: "text-purple-600 bg-purple-50" },
    { label: "Add Project", href: "/admin/projects", icon: FolderOpen, color: "text-teal-600 bg-teal-50" },
    { label: "Write Blog Post", href: "/admin/blog", icon: BookOpen, color: "text-indigo-600 bg-indigo-50" },
    { label: "Add Testimonial", href: "/admin/testimonials", icon: Star, color: "text-yellow-600 bg-yellow-50" },
    { label: "View Quotes", href: "/admin/quotes", icon: FileText, color: "text-amber-600 bg-amber-50" },
    { label: "View Messages", href: "/admin/messages", icon: MessageSquare, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back — here's what's happening today</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
            backendOnline ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          )}>
            <div className={cn("w-2 h-2 rounded-full", backendOnline ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            {backendOnline ? "Backend Online" : "Backend Offline"}
          </div>
          <button onClick={fetchData} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Backend offline warning */}
      {!loading && !backendOnline && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <strong>Backend not connected.</strong> The FastAPI server at{" "}
            <code className="bg-red-100 px-1 rounded">localhost:8000</code> is not reachable.
            Stats and data will not load until the backend is running.
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="h-28 rounded-2xl skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, href, alert }, i) => {
            const c = colorMap[color] || colorMap.green;
            return (
              <motion.div key={label} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
                <Link href={href} className="bg-white rounded-2xl p-5 block hover:shadow-lg transition-all group border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {alert && <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
                  </div>
                  <div className="text-3xl font-black text-navy-900 font-heading mb-1">{value ?? "—"}</div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Charts + Recent Leads row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lead Distribution Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-lg font-bold text-navy-900 font-heading mb-4">Lead Distribution</h2>
          {leadChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              <p>No lead data to chart yet.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {leadChartData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [val, "Leads"]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Leads Table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900 font-heading">Recent Leads</h2>
            <Link href="/admin/leads" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {leadsLoading ? (
              <div className="p-4 space-y-3">
                {Array(5).fill(0).map((_, i) => <div key={i} className="h-12 rounded-xl skeleton" />)}
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No leads yet. They'll appear here when visitors submit the contact form.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Customer</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Phone</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Location</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Date</th>
                      <th className="text-right px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-navy-900">{lead.full_name}</td>
                        <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />{lead.phone}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">
                          {lead.city ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{lead.city}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-600"}`}>
                            {STATUS_LABELS[lead.status] || lead.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(lead.created_at)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent Activity row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-navy-900 mb-4 font-heading">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map(({ label, href, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-auto transition-colors" />
              </Link>
            ))}
          </div>

          {/* Getting started tip */}
          <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Getting Started</span>
            </div>
            <p className="text-xs text-green-700 leading-relaxed">
              Go to <strong>Settings</strong> to configure business info (phone, WhatsApp, address, stats),
              then add products, projects, and blog posts to populate your website.
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy-900 font-heading">Recent Activity</h2>
            <Link href="/admin/activity" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {recentActivity.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No activity logged yet. Actions will appear here as you use the admin panel.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentActivity.map((entry) => {
                  const ActionIcon = ACTION_ICONS[entry.action] || ACTION_ICONS.default;
                  return (
                    <div key={entry.id} className="flex items-start gap-3 px-5 py-3.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ActionIcon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-navy-900">
                          <span className="font-medium">{entry.user_email || "System"}</span>
                          {" "}
                          <span className="text-gray-500">{entry.action}</span>
                          {" "}
                          <span className="font-medium text-gray-700">{entry.entity}</span>
                          {entry.details && (
                            <span className="text-gray-400"> — {entry.details}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.created_at)}</p>
                      </div>
                      {entry.entity_id && (
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
