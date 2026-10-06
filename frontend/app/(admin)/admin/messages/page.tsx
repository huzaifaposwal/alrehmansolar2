"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MessageSquare, Mail, Phone, Clock, CheckCircle2, RefreshCw, Eye
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";

interface ContactMessage {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getMessages(token);
      setMessages(data || []);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const markRead = async (msg: ContactMessage) => {
    if (msg.is_read) {
      setSelected(msg);
      return;
    }
    try {
      await adminApi.markMessageRead(token, msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      setSelected({ ...msg, is_read: true });
    } catch {
      toast.error("Failed to mark as read");
      setSelected(msg);
    }
  };

  const filtered = messages.filter(m =>
    filter === "all" ? true : filter === "unread" ? !m.is_read : m.is_read
  );

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 && <span className="text-orange-600 font-semibold">{unreadCount} unread · </span>}
            {messages.length} total
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "unread", "read"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
              filter === f
                ? "bg-green-600 text-white border-green-600 shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Message List */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl skeleton" />)
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No messages found.</p>
            </div>
          ) : (
            filtered.map(msg => (
              <button
                key={msg.id}
                onClick={() => markRead(msg)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all",
                  selected?.id === msg.id
                    ? "bg-green-50 border-green-200 shadow-sm"
                    : msg.is_read
                      ? "bg-white border-gray-100 hover:bg-gray-50"
                      : "bg-white border-blue-100 hover:bg-blue-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm",
                    msg.is_read ? "bg-gray-100 text-gray-500" : "bg-blue-600 text-white"
                  )}>
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-sm font-semibold truncate", !msg.is_read && "text-navy-900")}>{msg.name}</p>
                      {!msg.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{msg.subject || msg.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatDate(msg.created_at)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-navy-900 font-heading">{selected.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{selected.subject || "No subject"}</p>
                </div>
                {selected.is_read
                  ? <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100"><CheckCircle2 className="w-3.5 h-3.5" /> Read</span>
                  : <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100"><Eye className="w-3.5 h-3.5" /> Unread</span>
                }
              </div>

              {/* Contact info */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Email</p>
                    <a href={`mailto:${selected.email}`} className="text-sm font-medium text-blue-600 hover:underline truncate block">{selected.email}</a>
                  </div>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Phone</p>
                      <a href={`tel:${selected.phone}`} className="text-sm font-medium text-gray-800">{selected.phone}</a>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Received</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(selected.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Message body */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              {/* Reply actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your Inquiry"}&body=Dear ${selected.name},%0A%0AThank you for contacting Al Rehman Solar System %26 UPS.%0A%0A`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Mail className="w-4 h-4" /> Reply via Email
                </a>
                {selected.phone && (
                  <a
                    href={`https://wa.me/${selected.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${selected.name}, thank you for contacting Al Rehman Solar System & UPS.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium">Select a message to view</p>
              <p className="text-sm mt-1">Click on any message from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
