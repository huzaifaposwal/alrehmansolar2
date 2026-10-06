"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Save, RefreshCw, Settings, Globe, Phone, MapPin, AlertCircle,
  Share2, Search, Building
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import type { SiteSetting } from "@/types";

interface SettingField {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea" | "number";
  description?: string;
}

interface SettingGroup {
  group: string;
  label: string;
  icon: any;
  keys: SettingField[];
}

const SETTING_GROUPS: SettingGroup[] = [
  {
    group: "business",
    label: "Business Information",
    icon: Building,
    keys: [
      { key: "business_name", label: "Business Name", placeholder: "AL REHMAN SOLAR SYSTEM & UPS" },
      { key: "tagline", label: "Tagline", placeholder: "Reliable Solar & UPS Solutions in Lahore" },
      { key: "phone", label: "Phone Number", placeholder: "+92 300 6639477" },
      { key: "whatsapp", label: "WhatsApp Number (with country code, no +)", placeholder: "923006639477" },
      { key: "email", label: "Email Address", placeholder: "alrehmansolarspk@gmail.com" },
      { key: "footer_text", label: "Footer Copyright", placeholder: "© 2024 AL REHMAN SOLAR SYSTEM & UPS. All rights reserved." },
    ],
  },
  {
    group: "contact",
    label: "Location & Hours",
    icon: MapPin,
    keys: [
      {
        key: "address",
        label: "Office Address",
        placeholder: "Edan Abad A Block, near Khayaban-e-Amin, Edenabad, Lahore, Pakistan",
        type: "textarea",
      },
      {
        key: "business_hours",
        label: "Business Hours",
        placeholder: "Mon–Sat: 9:00 AM – 6:00 PM",
      },
      {
        key: "google_maps_embed",
        label: "Google Maps Embed URL",
        placeholder: "https://www.google.com/maps/embed?pb=...",
        type: "textarea",
        description: "Paste the src URL from Google Maps Embed iframe",
      },
    ],
  },
  {
    group: "social",
    label: "Social Media Links",
    icon: Share2,
    keys: [
      { key: "facebook_url", label: "Facebook Page URL", placeholder: "https://facebook.com/alrehmansolar" },
      { key: "instagram_url", label: "Instagram Profile URL", placeholder: "https://instagram.com/alrehmansolar" },
      { key: "youtube_url", label: "YouTube Channel URL", placeholder: "https://youtube.com/@alrehmansolar" },
      { key: "linkedin_url", label: "LinkedIn Company URL", placeholder: "https://linkedin.com/company/alrehmansolar" },
      { key: "tiktok_url", label: "TikTok Profile URL", placeholder: "https://tiktok.com/@alrehmansolar" },
    ],
  },
  {
    group: "stats",
    label: "Homepage Statistics",
    icon: AlertCircle,
    keys: [
      { key: "stat_projects_completed", label: "Projects Completed", placeholder: "250", type: "number" },
      { key: "stat_installed_capacity_kw", label: "Total kW Installed", placeholder: "1200", type: "number" },
      { key: "stat_years_experience", label: "Years of Experience", placeholder: "7", type: "number" },
      { key: "stat_happy_customers", label: "Happy Customers", placeholder: "200", type: "number" },
    ],
  },
  {
    group: "seo",
    label: "Global SEO Defaults",
    icon: Search,
    keys: [
      {
        key: "seo_default_title",
        label: "Default Website Title",
        placeholder: "AL REHMAN SOLAR SYSTEM & UPS — Lahore's Leading Solar Provider",
      },
      {
        key: "seo_default_description",
        label: "Default Meta Description",
        placeholder: "Professional solar panel installation, hybrid solar systems, UPS solutions and solar inverters in Lahore, Pakistan. Free on-site consultation.",
        type: "textarea",
      },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState("business");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const allSettings: SiteSetting[] = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/settings`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(r => r.json()).catch(() => []);

      const map: Record<string, string> = {};
      if (Array.isArray(allSettings)) {
        allSettings.forEach((s) => {
          map[s.key] = s.value || "";
        });
      }

      // Compatibility fallbacks between legacy keys and seeded keys
      if (!map["phone"] && map["business_phone"]) map["phone"] = map["business_phone"];
      if (!map["whatsapp"] && map["business_whatsapp"]) map["whatsapp"] = map["business_whatsapp"];
      if (!map["email"] && map["business_email"]) map["email"] = map["business_email"];
      if (!map["address"] && map["business_address"]) map["address"] = map["business_address"];
      if (!map["facebook_url"] && map["social_facebook"]) map["facebook_url"] = map["social_facebook"];
      if (!map["instagram_url"] && map["social_instagram"]) map["instagram_url"] = map["social_instagram"];
      if (!map["youtube_url"] && map["social_youtube"]) map["youtube_url"] = map["social_youtube"];
      if (!map["seo_default_title"] && map["seo_meta_title"]) map["seo_default_title"] = map["seo_meta_title"];
      if (!map["seo_default_description"] && map["seo_meta_description"]) map["seo_default_description"] = map["seo_meta_description"];

      setSettings(map);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async (groupKeys: SettingField[]) => {
    setSaving(true);
    try {
      const subset: Record<string, string> = {};
      groupKeys.forEach(({ key }) => {
        if (settings[key] !== undefined) {
          subset[key] = settings[key];
        }
      });

      // Synchronize mirrored legacy keys for maximum compatibility
      if (subset["phone"]) subset["business_phone"] = subset["phone"];
      if (subset["whatsapp"]) subset["business_whatsapp"] = subset["whatsapp"];
      if (subset["email"]) subset["business_email"] = subset["email"];
      if (subset["address"]) subset["business_address"] = subset["address"];
      if (subset["facebook_url"]) subset["social_facebook"] = subset["facebook_url"];
      if (subset["instagram_url"]) subset["social_instagram"] = subset["instagram_url"];
      if (subset["youtube_url"]) subset["social_youtube"] = subset["youtube_url"];
      if (subset["seo_default_title"]) subset["seo_meta_title"] = subset["seo_default_title"];
      if (subset["seo_default_description"]) subset["seo_meta_description"] = subset["seo_default_description"];

      await adminApi.bulkUpdateSettings(token, subset);
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const activeGroupData = SETTING_GROUPS.find(g => g.group === activeGroup);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Settings</h1>
          <p className="text-gray-500 text-sm">Configure website content, contact information, social links, and SEO defaults.</p>
        </div>
        <button onClick={fetchSettings} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Group Sidebar */}
        <div className="space-y-2">
          {SETTING_GROUPS.map(({ group, label, icon: Icon }) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                activeGroup === group
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-100"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {loading ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => <div key={i} className="h-12 rounded-xl skeleton" />)}
              </div>
            ) : activeGroupData ? (
              <>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <activeGroupData.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-navy-900 font-heading">{activeGroupData.label}</h2>
                    <p className="text-xs text-gray-400">Manage settings for {activeGroupData.label.toLowerCase()}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {activeGroupData.keys.map(({ key, label, placeholder, type, description }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                      {type === "textarea" ? (
                        <textarea
                          rows={3}
                          className="form-input resize-y text-sm"
                          placeholder={placeholder}
                          value={settings[key] || ""}
                          onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                        />
                      ) : (
                        <input
                          type={type || "text"}
                          className="form-input"
                          placeholder={placeholder}
                          value={settings[key] || ""}
                          onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                        />
                      )}
                      {description && (
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                      )}
                      <p className="text-[10px] text-gray-300 mt-1">DB key: <code className="bg-gray-100 px-1 rounded">{key}</code></p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleSave(activeGroupData.keys)}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <><Save className="w-4 h-4" /> Save {activeGroupData.label}</>
                    )}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
