"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Calculator, Save, RefreshCw, Info, Zap, DollarSign, Sun, Leaf, TrendingDown
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";

// The calculator settings that map to SiteSettings keys
const CALCULATOR_SETTINGS = [
  {
    group: "tariff",
    label: "Electricity Tariff",
    icon: DollarSign,
    color: "text-orange-600 bg-orange-50",
    fields: [
      {
        key: "calc_electricity_tariff_pkr_per_kwh",
        label: "Electricity Rate (PKR per kWh)",
        description: "Current LESCO/FESCO tariff rate used to estimate savings.",
        placeholder: "50",
        type: "number",
        unit: "PKR/kWh",
      },
    ],
  },
  {
    group: "solar",
    label: "Solar Generation",
    icon: Sun,
    color: "text-yellow-600 bg-yellow-50",
    fields: [
      {
        key: "calc_peak_sun_hours_per_day",
        label: "Peak Sun Hours per Day",
        description: "Average daily peak sun hours for Lahore (typically 4.5–5.5).",
        placeholder: "5.0",
        type: "number",
        unit: "hours/day",
      },
      {
        key: "calc_system_efficiency",
        label: "System Efficiency (%)",
        description: "Overall system efficiency accounting for inverter losses, wiring, temperature derating.",
        placeholder: "80",
        type: "number",
        unit: "%",
      },
      {
        key: "calc_kw_per_100_sqft",
        label: "kW per 100 sqft of Roof",
        description: "Rule of thumb for Pakistan — used when roof size is provided.",
        placeholder: "1.0",
        type: "number",
        unit: "kW/100sqft",
      },
    ],
  },
  {
    group: "cost",
    label: "System Cost & Payback",
    icon: TrendingDown,
    color: "text-blue-600 bg-blue-50",
    fields: [
      {
        key: "calc_cost_per_kw_pkr",
        label: "Cost per kW Installed (PKR)",
        description: "Approximate installed cost per kW used for payback calculation.",
        placeholder: "120000",
        type: "number",
        unit: "PKR/kW",
      },
      {
        key: "calc_self_consumption_ratio",
        label: "Self Consumption Ratio (%)",
        description: "Percentage of generated electricity that the customer consumes directly (vs. exported).",
        placeholder: "85",
        type: "number",
        unit: "%",
      },
      {
        key: "calc_battery_multiplier_hybrid",
        label: "Hybrid Battery Multiplier",
        description: "Cost factor multiplier for hybrid systems with battery storage (e.g. 1.35 = +35%).",
        placeholder: "1.35",
        type: "number",
        unit: "multiplier",
      },
      {
        key: "calc_battery_multiplier_offgrid",
        label: "Off-Grid Battery Multiplier",
        description: "Cost factor multiplier for full off-grid battery systems (e.g. 1.55 = +55%).",
        placeholder: "1.55",
        type: "number",
        unit: "multiplier",
      },
    ],
  },
  {
    group: "environment",
    label: "Environmental",
    icon: Leaf,
    color: "text-green-600 bg-green-50",
    fields: [
      {
        key: "calc_co2_kg_per_kwh",
        label: "CO₂ Factor (kg per kWh)",
        description: "Pakistan grid emission factor (kg CO₂ per kWh). Used for CO₂ savings estimate.",
        placeholder: "0.47",
        type: "number",
        unit: "kg/kWh",
      },
    ],
  },
  {
    group: "disclaimer",
    label: "Disclaimers & Notes",
    icon: Info,
    color: "text-purple-600 bg-purple-50",
    fields: [
      {
        key: "calc_disclaimer",
        label: "Calculator Assumptions Disclaimer",
        description: "Main disclaimer displayed under calculator results clarifying values are estimates.",
        placeholder: "All values are estimates based on general assumptions for Lahore, Pakistan. Contact Al Rehman Solar for a professional on-site assessment.",
        type: "textarea",
      },
      {
        key: "calc_final_quote_notice",
        label: "Estimated vs Final Quotation Notice",
        description: "Notice explaining that final quotation will be provided after structural site inspection.",
        placeholder: "Final quotation may vary depending on structure requirements, cable distance, and panel brand availability.",
        type: "textarea",
      },
    ],
  },
];

export default function AdminCalculatorPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState("tariff");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") || "" : "";

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API}/api/v1/settings`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const map: Record<string, string> = {};
      if (Array.isArray(data)) {
        data.forEach((s: any) => { map[s.key] = s.value || ""; });
      }
      setSettings(map);
    } catch {
      toast.error("Failed to load calculator settings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const activeGroupData = CALCULATOR_SETTINGS.find(g => g.group === activeGroup);

  const handleSave = async () => {
    if (!activeGroupData) return;
    setSaving(true);
    try {
      const subset: Record<string, string> = {};
      activeGroupData.fields.forEach(({ key }) => {
        if (settings[key] !== undefined) subset[key] = settings[key];
      });
      await adminApi.bulkUpdateSettings(token, subset);
      toast.success(`${activeGroupData.label} settings saved!`);
    } catch {
      toast.error("Failed to save settings. Make sure the backend is running.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-heading">Calculator Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure the assumptions used by the AI Solar Calculator shown on your website.
          </p>
        </div>
        <button onClick={fetchSettings} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>How it works:</strong> These settings are stored in the database and used by the solar calculator on your website.
          Changes take effect immediately after saving. The values below act as defaults — the calculator logic automatically
          adjusts for roof size and monthly bill inputs from visitors.
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Group sidebar */}
        <div className="space-y-2">
          {CALCULATOR_SETTINGS.map(({ group, label, icon: Icon, color }) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all",
                activeGroup === group
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-100"
              )}
            >
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", activeGroup === group ? "bg-white/20" : color)}>
                <Icon className="w-4 h-4" />
              </div>
              {label}
            </button>
          ))}
        </div>

        {/* Settings form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl skeleton" />)}
              </div>
            ) : activeGroupData ? (
              <>
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", activeGroupData.color)}>
                    <activeGroupData.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-navy-900 font-heading">{activeGroupData.label}</h2>
                    <p className="text-xs text-gray-400">Configure {activeGroupData.label.toLowerCase()} assumptions</p>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {activeGroupData.fields.map(({ key, label, description, placeholder, type, unit }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-semibold text-gray-700">{label}</label>
                        {unit && (
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">{unit}</span>
                        )}
                      </div>
                      {type === "textarea" ? (
                        <textarea
                          rows={3}
                          className="form-input resize-y text-sm"
                          placeholder={placeholder}
                          value={settings[key] || ""}
                          onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                        />
                      ) : (
                        <input
                          type={type}
                          step="any"
                          className="form-input"
                          placeholder={placeholder}
                          value={settings[key] || ""}
                          onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                        />
                      )}
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{description}</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        DB key: <code className="bg-gray-100 px-1 rounded">{key}</code>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="px-6 pb-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
