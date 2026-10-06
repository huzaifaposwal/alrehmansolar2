"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sun, MapPin, Zap, Battery, Calculator, CheckCircle2,
  ArrowRight, ArrowLeft, TrendingUp, Leaf, Clock,
  Home, Building2, Factory, CircleDollarSign,
  Info, Sparkles, CloudSun, RefreshCw, BatteryCharging,
  BarChart2, Cpu,
} from "lucide-react";
import { cn, formatPKR, getWhatsAppLink } from "@/lib/utils";

// ─── WhatsApp ────────────────────────────────────────────────────────────────
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923000000000";

// ─── City Data ────────────────────────────────────────────────────────────────
// Peak sun hours: estimated annual averages based on NASA/NREL Solar Atlas data
// Actual values vary by season (±15–20%), roof tilt, orientation, and local shading.
// These are ESTIMATION DEFAULTS and can be edited by the user.

interface CityInfo {
  name: string;
  peakSunHours: number;
  region: string;
}

const CITIES: CityInfo[] = [
  { name: "Lahore",      peakSunHours: 4.7,  region: "Punjab" },
  { name: "Islamabad",   peakSunHours: 4.8,  region: "Capital" },
  { name: "Rawalpindi",  peakSunHours: 4.8,  region: "Punjab" },
  { name: "Karachi",     peakSunHours: 5.5,  region: "Sindh" },
  { name: "Faisalabad",  peakSunHours: 4.9,  region: "Punjab" },
  { name: "Multan",      peakSunHours: 5.2,  region: "Punjab" },
  { name: "Gujranwala",  peakSunHours: 4.6,  region: "Punjab" },
  { name: "Sialkot",     peakSunHours: 4.6,  region: "Punjab" },
  { name: "Peshawar",    peakSunHours: 5.0,  region: "KPK" },
  { name: "Quetta",      peakSunHours: 5.5,  region: "Balochistan" },
  { name: "Bahawalpur",  peakSunHours: 5.3,  region: "Punjab" },
  { name: "Sargodha",    peakSunHours: 4.8,  region: "Punjab" },
  { name: "Other",       peakSunHours: 4.8,  region: "Pakistan" },
];

// ─── Calculation Constants ────────────────────────────────────────────────────
// All costs are ROUGH ESTIMATES only (Pakistan market 2024–2025).
// Actual costs depend on brand, market conditions, and supplier at time of purchase.

const PANEL_WATTS        = 545;     // Standard Tier-1 mono-PERC panel wattage (W)
const PANEL_COST         = 46_000;  // Estimated PKR per 545W panel
const BATTERY_KWH        = 4.8;     // kWh per 100Ah 48V LiFePO4 unit
const BATTERY_COST       = 225_000; // Estimated PKR per 100Ah 48V LiFePO4 battery
const PERF_RATIO         = 0.78;    // System performance ratio (temp, wiring, inverter losses)
const SOLAR_COVERAGE     = 0.80;    // Estimated % of monthly load offset by solar
const INSTALL_OVERHEAD   = 0.18;    // Installation, mounting, wiring, BOS as % of equipment
const CO2_FACTOR         = 0.42;    // kg CO₂ per kWh (Pakistan national grid emission factor)

const INVERTER_SIZES = [1, 1.5, 2, 3, 5, 6, 8, 10, 12, 15, 20, 25, 30];

function roundUpInverter(requiredKW: number): number {
  // Select next standard inverter size above required (with 10% sizing buffer)
  for (const kw of INVERTER_SIZES) {
    if (kw >= requiredKW * 1.1) return kw;
  }
  return 30;
}

function inverterCost(kw: number): number {
  // Hybrid inverter approximate market prices (PKR)
  if (kw <= 1.5) return  120_000;
  if (kw <= 2)   return  165_000;
  if (kw <= 3)   return  220_000;
  if (kw <= 5)   return  330_000;
  if (kw <= 6)   return  430_000;
  if (kw <= 8)   return  560_000;
  if (kw <= 10)  return  700_000;
  if (kw <= 12)  return  880_000;
  if (kw <= 15)  return 1_080_000;
  if (kw <= 20)  return 1_450_000;
  if (kw <= 25)  return 1_950_000;
  return 2_600_000;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SystemType   = "hybrid" | "on-grid" | "off-grid";
type PropertyType = "residential" | "commercial" | "industrial";
type InputMode    = "bill" | "units";

interface FormState {
  city:               CityInfo;
  customCityName:     string;
  customPeakSunHours: string;
  inputMode:          InputMode;
  monthlyBill:        string;
  monthlyUnits:       string;
  unitRate:           string;
  systemType:         SystemType;
  propertyType:       PropertyType;
  backupHours:        number;
}

interface CalcResult {
  monthlyUnits:     number;
  systemSizeKW:     number;
  panelCount:       number;
  actualSystemKW:   number;
  inverterKW:       number;
  batteryCount:     number;
  batteryKWh:       number;
  totalCostMin:     number;
  totalCostMax:     number;
  monthlySavings:   number;
  annualSavings:    number;
  paybackYears:     number;
  annualGenKWh:     number;
  co2Kg:            number;
}

// ─── Calculation Engine ───────────────────────────────────────────────────────

function runCalc(form: FormState): CalcResult {
  const unitRate   = Math.max(1, parseFloat(form.unitRate)   || 60);
  const psh        = form.city.name === "Other"
    ? Math.max(2, parseFloat(form.customPeakSunHours) || 4.8)
    : form.city.peakSunHours;

  // --- Monthly units consumed ---
  const monthlyUnits =
    form.inputMode === "bill"
      ? (parseFloat(form.monthlyBill)  || 0) / unitRate
      : (parseFloat(form.monthlyUnits) || 0);

  const dailyUnits = monthlyUnits / 30;

  // --- System size (kW) ---
  // Formula: P(kW) = E(kWh/day) ÷ (PSH × performance_ratio)
  const systemSizeKW = dailyUnits / (psh * PERF_RATIO);

  // --- Panels ---
  const panelCount      = Math.max(1, Math.ceil((systemSizeKW * 1000) / PANEL_WATTS));
  const actualSystemKW  = (panelCount * PANEL_WATTS) / 1000;

  // --- Inverter ---
  const inverterKW = roundUpInverter(actualSystemKW);

  // --- Battery (hybrid / off-grid only) ---
  // Sized to cover backupHours of typical evening/night usage (50% of daily load)
  let batteryCount = 0;
  let batteryKWh   = 0;
  if (form.systemType !== "on-grid") {
    const rawKWh  = (dailyUnits * 0.5) * (form.backupHours / 12) * 1.25; // 25% DOD buffer
    batteryCount  = Math.max(1, Math.ceil(rawKWh / BATTERY_KWH));
    batteryKWh    = batteryCount * BATTERY_KWH;
  }

  // --- Costs ---
  const panelEquip  = panelCount   * PANEL_COST;
  const invEquip    = inverterCost(inverterKW);
  const batEquip    = batteryCount * BATTERY_COST;
  const equipment   = panelEquip + invEquip + batEquip;
  const install     = equipment * INSTALL_OVERHEAD;
  const base        = equipment + install;

  const totalCostMin = base * 0.88;  // −12% (lower range)
  const totalCostMax = base * 1.15;  // +15% (upper range)

  // --- Savings ---
  const monthlySavings = monthlyUnits * SOLAR_COVERAGE * unitRate;
  const annualSavings  = monthlySavings * 12;
  const paybackYears   = annualSavings > 0 ? base / annualSavings : 0;

  // --- Environmental ---
  const annualGenKWh = actualSystemKW * psh * 365 * 0.85;  // 85% availability factor
  const co2Kg        = annualGenKWh * CO2_FACTOR;

  return {
    monthlyUnits,
    systemSizeKW,
    panelCount,
    actualSystemKW,
    inverterKW,
    batteryCount,
    batteryKWh,
    totalCostMin,
    totalCostMax,
    monthlySavings,
    annualSavings,
    paybackYears,
    annualGenKWh,
    co2Kg,
  };
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const slide = {
  enter: (d: number) => ({ x: d > 0 ? 70 : -70, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut"  as const } },
  exit:   (d: number) => ({ x: d > 0 ? -70 : 70, opacity: 0, transition: { duration: 0.25, ease: "easeIn" as const } }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const STEP_META = [
  { label: "Location", icon: MapPin },
  { label: "Energy",   icon: Zap    },
  { label: "System",   icon: Cpu    },
  { label: "Results",  icon: BarChart2 },
];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8 px-1">
      <div className="relative flex items-center justify-between">
        {/* background track */}
        <div className="absolute inset-y-4 left-4 right-4 h-0.5 bg-gray-200 -translate-y-0.5" />
        {/* green fill */}
        <motion.div
          className="absolute inset-y-4 left-4 h-0.5 bg-green-500 origin-left -translate-y-0.5"
          animate={{ scaleX: (step - 1) / 3 }}
          style={{ width: "calc(100% - 2rem)", transformOrigin: "left" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        {STEP_META.map(({ label, icon: Icon }, i) => {
          const s     = i + 1;
          const done  = step > s;
          const active = step === s;
          return (
            <div key={label} className="relative flex flex-col items-center z-10 gap-1.5">
              <motion.div
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors duration-300",
                  done   ? "bg-green-600 border-green-600 text-white"
                  : active ? "bg-white border-green-500 text-green-600"
                  :          "bg-white border-gray-200 text-gray-400"
                )}
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {done
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <Icon className="w-3.5 h-3.5" />
                }
              </motion.div>
              <span className={cn(
                "text-[10px] font-semibold hidden sm:block uppercase tracking-wide",
                active ? "text-green-600" : done ? "text-gray-500" : "text-gray-300"
              )}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 1 : Location ────────────────────────────────────────────────────────

function Step1Location({ form, update }: { form: FormState; update: (f: Partial<FormState>) => void }) {
  const isOther = form.city.name === "Other";
  const displayPSH = isOther
    ? parseFloat(form.customPeakSunHours) || 4.8
    : form.city.peakSunHours;

  return (
    <div className="card p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-glow-green flex-shrink-0">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-navy-900 font-heading text-xl">Your Location</h2>
          <p className="text-gray-500 text-sm">Select your city to use local estimated peak sun hours</p>
        </div>
      </div>

      {/* City grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
        {CITIES.map((city) => {
          const selected = form.city.name === city.name;
          return (
            <button
              key={city.name}
              onClick={() => update({ city })}
              className={cn(
                "py-2.5 px-2 rounded-xl text-sm font-semibold text-center border-2 transition-all duration-150 leading-tight",
                selected
                  ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                  : "border-gray-100 bg-gray-50/50 text-gray-600 hover:border-green-300 hover:bg-green-50/40"
              )}
            >
              {city.name}
            </button>
          );
        })}
      </div>

      {/* Custom city fields */}
      <AnimatePresence>
        {isOther && (
          <motion.div
            key="custom-city"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{    opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid sm:grid-cols-2 gap-4 mb-5 pt-1">
              <div>
                <label className="form-label">City Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your city"
                  value={form.customCityName}
                  onChange={(e) => update({ customCityName: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">
                  Peak Sun Hours (hrs/day)
                  <span className="text-gray-400 font-normal ml-1">— editable</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  step="0.1"
                  min="3"
                  max="7"
                  value={form.customPeakSunHours}
                  onChange={(e) => update({ customPeakSunHours: e.target.value })}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected city info card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-glow-green">
          <Sun className="w-7 h-7 text-white animate-spin-slow" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-navy-900 font-heading truncate">
            {isOther ? (form.customCityName || "Custom City") : form.city.name}
            {!isOther && (
              <span className="text-gray-400 font-normal text-sm ml-2">({form.city.region})</span>
            )}
          </p>
          <div className="flex items-end gap-1 mt-0.5">
            <span className="text-3xl font-black text-green-600 font-heading leading-none">
              {displayPSH.toFixed(1)}
            </span>
            <span className="text-gray-500 text-sm mb-0.5">hrs/day estimated peak sunlight</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Info className="w-3 h-3 flex-shrink-0" />
            Estimated annual average · Actual varies by season &amp; site conditions
          </p>
        </div>
      </div>

      {/* Sun hours context */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
        {[
          { city: "Karachi",  psh: "5.5", note: "High sun" },
          { city: "Lahore",   psh: "4.7", note: "Moderate" },
          { city: "National", psh: "4.8", note: "Avg. est." },
        ].map(({ city, psh, note }) => (
          <div key={city} className="bg-gray-50 rounded-xl p-2">
            <p className="font-bold text-navy-700 text-sm">{psh} hrs</p>
            <p className="text-gray-400 mt-0.5">{city}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2 : Energy Usage ────────────────────────────────────────────────────

const BILL_PRESETS  = [3_000, 6_000, 10_000, 15_000, 25_000];
const UNITS_PRESETS = [100, 200, 350, 500, 750];
const RATE_PRESETS  = [45, 55, 65, 75];

function Step2Energy({ form, update }: { form: FormState; update: (f: Partial<FormState>) => void }) {
  return (
    <div className="card p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-gradient-to-br from-solar-400 to-solar-500 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-navy-900" />
        </div>
        <div>
          <h2 className="font-bold text-navy-900 font-heading text-xl">Your Energy Usage</h2>
          <p className="text-gray-500 text-sm">Enter your monthly electricity bill or units consumed</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 w-fit">
        {(["bill", "units"] as InputMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => update({ inputMode: mode })}
            className={cn(
              "px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
              form.inputMode === mode
                ? "bg-white text-navy-900 shadow-card"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {mode === "bill" ? "💰 Monthly Bill" : "⚡ Monthly Units"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {form.inputMode === "bill" ? (
          <motion.div key="bill" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <label className="form-label">Monthly Electricity Bill (PKR)</label>
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">
                PKR
              </span>
              <input
                id="monthlyBill"
                type="number"
                min="0"
                className="form-input pl-14 text-lg font-semibold"
                placeholder="e.g. 8,000"
                value={form.monthlyBill}
                onChange={(e) => update({ monthlyBill: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {BILL_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => update({ monthlyBill: String(p) })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all",
                    form.monthlyBill === String(p)
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                  )}
                >
                  {p.toLocaleString("en-PK")}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="units" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <label className="form-label">Monthly Units Consumed (kWh)</label>
            <div className="relative mb-3">
              <input
                id="monthlyUnits"
                type="number"
                min="0"
                className="form-input text-lg font-semibold pr-28"
                placeholder="e.g. 350"
                value={form.monthlyUnits}
                onChange={(e) => update({ monthlyUnits: e.target.value })}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                kWh/month
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {UNITS_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => update({ monthlyUnits: String(p) })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all",
                    form.monthlyUnits === String(p)
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                  )}
                >
                  {p} kWh
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unit rate */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <label className="form-label">
          Electricity Unit Rate (PKR / kWh)
          <span className="text-gray-400 font-normal ml-1.5">— check your bill or use an estimate</span>
        </label>
        <input
          id="unitRate"
          type="number"
          min="1"
          max="200"
          className="form-input mb-2"
          value={form.unitRate}
          onChange={(e) => update({ unitRate: e.target.value })}
        />
        <div className="flex flex-wrap gap-2">
          {RATE_PRESETS.map((r) => (
            <button
              key={r}
              onClick={() => update({ unitRate: String(r) })}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-all",
                form.unitRate === String(r)
                  ? "bg-navy-800 text-white border-navy-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-navy-400"
              )}
            >
              PKR {r}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
          Unit rate varies by consumption slab and tariff category. Check your LESCO / DISCO bill for the exact per-unit rate, or use PKR 55–65 as a common estimate.
        </p>
      </div>
    </div>
  );
}

// ─── Step 3 : System Type ─────────────────────────────────────────────────────

const SYSTEM_OPTIONS: Array<{
  id: SystemType;
  icon: React.ElementType;
  label: string;
  desc: string;
  tag?: string;
  colorClass: string;
  activeIconBg: string;
  activeBorder: string;
  activeBg: string;
}> = [
  {
    id: "hybrid",
    icon: Zap,
    label: "Hybrid Solar",
    desc: "Solar + Battery + Grid. Stays on during load shedding. Most popular in Pakistan.",
    tag: "⭐ Recommended",
    colorClass: "text-green-600",
    activeIconBg: "bg-green-600",
    activeBorder: "border-green-500",
    activeBg: "bg-green-50",
  },
  {
    id: "on-grid",
    icon: CloudSun,
    label: "On-Grid Solar",
    desc: "Grid-connected only. Lowest upfront cost. Does NOT work during load shedding.",
    colorClass: "text-blue-600",
    activeIconBg: "bg-blue-600",
    activeBorder: "border-blue-400",
    activeBg: "bg-blue-50",
  },
  {
    id: "off-grid",
    icon: BatteryCharging,
    label: "Off-Grid Solar",
    desc: "Fully independent — no grid needed. Ideal for remote sites or total independence.",
    colorClass: "text-solar-600",
    activeIconBg: "bg-solar-500",
    activeBorder: "border-solar-400",
    activeBg: "bg-solar-50",
  },
];

const PROPERTY_OPTIONS: Array<{ id: PropertyType; icon: React.ElementType; label: string }> = [
  { id: "residential", icon: Home,      label: "Residential" },
  { id: "commercial",  icon: Building2, label: "Commercial"  },
  { id: "industrial",  icon: Factory,   label: "Industrial"  },
];

const BACKUP_OPTIONS = [2, 4, 6, 8, 12];

function Step3System({ form, update }: { form: FormState; update: (f: Partial<FormState>) => void }) {
  const needsBattery = form.systemType !== "on-grid";

  return (
    <div className="card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-navy-700 to-navy-900 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Cpu className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="font-bold text-navy-900 font-heading text-xl">System Preferences</h2>
          <p className="text-gray-500 text-sm">Choose the type of solar system you want</p>
        </div>
      </div>

      {/* System type */}
      <div>
        <p className="form-label">Solar System Type</p>
        <div className="grid gap-3">
          {SYSTEM_OPTIONS.map(({ id, icon: Icon, label, desc, tag, colorClass, activeIconBg, activeBorder, activeBg }) => {
            const active = form.systemType === id;
            return (
              <button
                key={id}
                onClick={() => update({ systemType: id })}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150",
                  active ? `${activeBorder} ${activeBg}` : "border-gray-100 bg-gray-50/50 hover:border-gray-300"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-150",
                  active ? activeIconBg : "bg-gray-200"
                )}>
                  <Icon className={cn("w-5 h-5", active ? "text-white" : "text-gray-400")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("font-bold font-heading", active ? "text-navy-900" : "text-gray-700")}>
                      {label}
                    </span>
                    {tag && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        {tag}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{desc}</p>
                </div>
                {active && <CheckCircle2 className={cn("w-5 h-5 flex-shrink-0 mt-0.5", colorClass)} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Property type */}
      <div>
        <p className="form-label">Property Type</p>
        <div className="grid grid-cols-3 gap-3">
          {PROPERTY_OPTIONS.map(({ id, icon: Icon, label }) => {
            const active = form.propertyType === id;
            return (
              <button
                key={id}
                onClick={() => update({ propertyType: id })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all",
                  active
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Backup hours — only for hybrid / off-grid */}
      <AnimatePresence>
        {needsBattery && (
          <motion.div
            key="backup"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{    opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="form-label">
              Required Battery Backup
              <span className="text-gray-400 font-normal ml-1">— hours of backup during load shedding</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {BACKUP_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => update({ backupHours: h })}
                  className={cn(
                    "flex-1 min-w-[52px] py-3 rounded-xl text-sm font-bold border-2 transition-all",
                    form.backupHours === h
                      ? "bg-navy-800 text-white border-navy-800"
                      : "bg-white text-gray-600 border-gray-200 hover:border-navy-400"
                  )}
                >
                  {h}h
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              6–8 hours is typical for most Pakistani homes. More backup hours = more batteries.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step 4 : Results ─────────────────────────────────────────────────────────

interface ResultCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "navy" | "solar" | "blue";
  delay?: number;
}

function ResultCard({ icon: Icon, label, value, sub, accent = "green", delay = 0 }: ResultCardProps) {
  const iconBg   = { green: "bg-green-50",  navy: "bg-navy-50",  solar: "bg-solar-50",  blue: "bg-blue-50"  }[accent];
  const iconText = { green: "text-green-600", navy: "text-navy-700", solar: "text-solar-600", blue: "text-blue-600" }[accent];

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-2xl p-5 shadow-card border border-gray-100"
    >
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", iconBg)}>
        <Icon className={cn("w-4 h-4", iconText)} />
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-black text-navy-900 font-heading text-lg leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

function Step4Results({
  result,
  form,
  onReset,
  onEdit,
}: {
  result:  CalcResult;
  form:    FormState;
  onReset: () => void;
  onEdit:  () => void;
}) {
  const isOther   = form.city.name === "Other";
  const cityName  = isOther ? (form.customCityName || "Custom City") : form.city.name;
  const sysLabel  = { hybrid: "Hybrid", "on-grid": "On-Grid", "off-grid": "Off-Grid" }[form.systemType];
  const propLabel = form.propertyType.charAt(0).toUpperCase() + form.propertyType.slice(1);

  const waMsg = `Hi! I used your solar calculator:\n• City: ${cityName}\n• Usage: ${result.monthlyUnits.toFixed(0)} kWh/month\n• System: ${result.actualSystemKW.toFixed(1)} kW ${sysLabel}\nI'd like a professional quote.`;

  return (
    <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" animate="show" className="space-y-4">

      {/* Summary header */}
      <motion.div variants={fadeUp} className="card p-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Estimation Complete</span>
          </div>
          <p className="font-bold text-navy-900 font-heading text-sm">
            {cityName} · {result.monthlyUnits.toFixed(0)} kWh/month · {sysLabel} · {propLabel}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">These are estimates only — see disclaimer below</p>
        </div>
        <button
          onClick={onEdit}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-navy-900 font-semibold border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-all"
        >
          <RefreshCw className="w-3 h-3" /> Edit
        </button>
      </motion.div>

      {/* Featured metric */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-6 bg-gradient-to-br from-green-600 to-green-700 text-white relative overflow-hidden"
      >
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-2 bottom-0 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Sun className="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <div>
            <p className="text-green-200 text-xs font-semibold uppercase tracking-wider mb-1">Recommended System Size</p>
            <p className="font-black text-white font-heading text-4xl leading-none">
              {result.actualSystemKW.toFixed(1)} <span className="text-2xl">kW</span>
            </p>
            <p className="text-green-200 text-sm mt-1">{sysLabel} Solar System · {result.panelCount} × {PANEL_WATTS}W Panels</p>
          </div>
        </div>
      </motion.div>

      {/* AI Recommendation */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-6 bg-gradient-to-r from-solar-50 to-orange-50 border border-solar-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-solar-600" />
          <h3 className="font-bold text-navy-900 font-heading text-lg">AI Solar Recommendation</h3>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">
          Based on your estimated electricity consumption and location in <strong>{cityName}</strong>, a{" "}
          <strong>{result.actualSystemKW.toFixed(1)} kW</strong> solar system is recommended. This can be built using approximately{" "}
          <strong>{result.panelCount} × {PANEL_WATTS}W panels</strong>.
          {result.batteryCount > 0 ? (
            <>
              {" "}Since you selected a {sysLabel} system, you&apos;ll also need a <strong>{result.inverterKW} kW inverter</strong> and{" "}
              <strong>{result.batteryCount} × 100Ah (48V) batteries</strong> to provide ~{form.backupHours} hours of backup during load shedding.
            </>
          ) : (
            <>
              {" "}Since you selected an On-Grid system, you&apos;ll need a <strong>{result.inverterKW} kW grid-tied inverter</strong>. Note that this system will not provide backup during load shedding.
            </>
          )}
          {" "}This setup is estimated to generate around <strong>{result.annualGenKWh.toFixed(0)} kWh</strong> annually, saving you approximately <strong>{formatPKR(result.annualSavings)}</strong> in the first year.
        </p>
      </motion.div>

      {/* System components */}
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mt-4">System Components</p>
      <div className="grid grid-cols-2 gap-3">
        <ResultCard
          icon={Sun}
          label="Solar Panels"
          value={`${result.panelCount} Panels`}
          sub={`${PANEL_WATTS}W each · ${result.actualSystemKW.toFixed(2)} kWp total`}
          accent="green"
        />
        <ResultCard
          icon={Zap}
          label="Inverter Size"
          value={`${result.inverterKW} kW`}
          sub={`${sysLabel} inverter recommended`}
          accent="navy"
        />
        {result.batteryCount > 0 && (
          <>
            <ResultCard
              icon={Battery}
              label="Battery Bank"
              value={`${result.batteryCount} × 100Ah`}
              sub={`${result.batteryKWh.toFixed(1)} kWh total · 48V LiFePO₄`}
              accent="solar"
            />
            <ResultCard
              icon={Clock}
              label="Backup Duration"
              value={`~${form.backupHours} hrs`}
              sub="Estimated backup during load shedding"
              accent="blue"
            />
          </>
        )}
      </div>

      {/* Financial */}
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Financial Estimates</p>
      <div className="grid grid-cols-2 gap-3">
        <ResultCard
          icon={CircleDollarSign}
          label="Est. Monthly Savings"
          value={formatPKR(result.monthlySavings)}
          sub={`${(SOLAR_COVERAGE * 100).toFixed(0)}% solar coverage assumed`}
          accent="green"
        />
        <ResultCard
          icon={TrendingUp}
          label="Est. Annual Savings"
          value={formatPKR(result.annualSavings)}
          sub="First-year estimate at current tariff"
          accent="green"
        />
        <ResultCard
          icon={BarChart2}
          label="Approx. Investment"
          value={`${formatPKR(result.totalCostMin)}`}
          sub={`Upper estimate: ${formatPKR(result.totalCostMax)} · Incl. install`}
          accent="navy"
        />
        <ResultCard
          icon={Clock}
          label="Est. Payback Period"
          value={result.paybackYears > 0 ? `~${result.paybackYears.toFixed(1)} yrs` : "—"}
          sub="Based on current electricity rates"
          accent="navy"
        />
      </div>

      {/* Environmental */}
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Environmental Impact</p>
      <div className="grid grid-cols-2 gap-3">
        <ResultCard
          icon={Leaf}
          label="CO₂ Offset / Year"
          value={`${(result.co2Kg / 1000).toFixed(1)} Tonnes`}
          sub="Carbon equivalent prevented annually"
          accent="green"
        />
        <ResultCard
          icon={Zap}
          label="Annual Generation"
          value={`${result.annualGenKWh.toFixed(0)} kWh`}
          sub="Estimated solar electricity produced"
          accent="solar"
        />
      </div>

      {/* CTA */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-6 bg-gradient-to-br from-navy-900 to-navy-950 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="relative z-10">
          <Sun className="w-10 h-10 text-green-400 mx-auto mb-3 animate-spin-slow" />
          <h3 className="font-bold text-white font-heading text-xl mb-2">Ready for an Accurate Quote?</h3>
          <p className="text-gray-400 text-sm mb-5 max-w-sm mx-auto">
            Our team provides a free on-site assessment with exact panel sizing, verified pricing, and guaranteed installation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/quote" className="btn-primary justify-center text-sm py-3">
              Get Free Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={getWhatsAppLink(WHATSAPP, waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-white justify-center text-sm py-3"
            >
              📱 WhatsApp Us
            </a>
          </div>
          <button
            onClick={onReset}
            className="mt-4 text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1.5 mx-auto transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Start New Calculation
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_FORM: FormState = {
  city:               CITIES[0], // Lahore
  customCityName:     "",
  customPeakSunHours: "4.8",
  inputMode:          "bill",
  monthlyBill:        "",
  monthlyUnits:       "",
  unitRate:           "60",
  systemType:         "hybrid",
  propertyType:       "residential",
  backupHours:        6,
};

export default function SolarCalculatorClient() {
  const [step,      setStep]      = useState(1);
  const [direction, setDirection] = useState(1);
  const [form,      setForm]      = useState<FormState>(DEFAULT_FORM);

  const update = useCallback((fields: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...fields }));
  }, []);

  const result = useMemo<CalcResult | null>(() => {
    if (step !== 4) return null;
    return runCalc(form);
  }, [form, step]);

  const canProceed = useMemo<boolean>(() => {
    if (step === 1) return true;
    if (step === 2) {
      if (form.inputMode === "bill")  return parseFloat(form.monthlyBill)  > 0;
      if (form.inputMode === "units") return parseFloat(form.monthlyUnits) > 0;
    }
    if (step === 3) return true;
    return false;
  }, [step, form]);

  const goNext = useCallback(() => {
    if (!canProceed) return;
    setDirection(1);
    setStep((s) => Math.min(4, s + 1));
  }, [canProceed]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const reset = useCallback(() => {
    setForm(DEFAULT_FORM);
    setDirection(1);
    setStep(1);
  }, []);

  return (
    <div className="min-h-screen">

      {/* ════ HERO ════ */}
      <section className="relative bg-gradient-hero pt-28 pb-16 bg-dots overflow-hidden" aria-label="AI Solar Calculator">
        {/* ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-green-600/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-solar-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.8s" }} />
        </div>

        <div className="container-main text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-semibold rounded-full mb-5">
              <Sparkles className="w-4 h-4" /> AI-Powered Estimation Tool
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-heading leading-tight">
              Calculate Your <span className="gradient-text">Solar System</span>
            </h1>

            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Get an instant estimate of your solar system size, panels, inverter, battery, savings and approximate investment.
            </p>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-6 mt-8"
          >
            {[
              { icon: "⚡", label: "Instant Results" },
              { icon: "🗺️", label: "Pakistan City Data" },
              { icon: "🆓", label: "100% Free" },
              { icon: "📱", label: "Mobile Friendly" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-400 text-sm">
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════ CALCULATOR ════ */}
      <section className="py-10 bg-gray-50" aria-label="Solar Calculator Form">
        <div className="container-main max-w-2xl">
          <ProgressBar step={step} />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {step === 1 && <Step1Location form={form} update={update} />}
              {step === 2 && <Step2Energy   form={form} update={update} />}
              {step === 3 && <Step3System   form={form} update={update} />}
              {step === 4 && result && (
                <Step4Results result={result} form={form} onReset={reset} onEdit={goPrev} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons (steps 1–3 only) */}
          {step < 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mt-5"
            >
              <button
                onClick={goPrev}
                disabled={step === 1}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  step === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 border-2 border-gray-200 hover:bg-white hover:shadow-card"
                )}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {/* Step counter */}
              <div className="text-xs text-gray-400 font-medium">
                Step {step} of 3
              </div>

              <button
                onClick={goNext}
                disabled={!canProceed}
                className={cn(
                  "btn-primary",
                  !canProceed && "opacity-40 cursor-not-allowed pointer-events-none"
                )}
              >
                {step === 3 ? (
                  <><Calculator className="w-4 h-4" /> Calculate Now</>
                ) : (
                  <>Continue <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ════ DISCLAIMER ════ */}
      <section className="py-8 bg-white border-t border-gray-100">
        <div className="container-main max-w-2xl">
          <div className="flex items-start gap-3 p-4 bg-solar-50 border border-solar-200 rounded-2xl">
            <Info className="w-4 h-4 text-solar-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-solar-800 leading-relaxed">
              <strong>Estimation Disclaimer:</strong> All values are approximate and based on standard industry
              assumptions for Pakistan. Actual system size, cost, and savings depend on site-specific factors
              including roof orientation, shading, local grid tariff slabs, equipment brands, and market prices
              at time of purchase. These figures are for initial planning only.
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-solar-700 font-medium">
                <span>• Panel: {PANEL_WATTS}W Tier-1 assumed</span>
                <span>• Performance ratio: {(PERF_RATIO * 100).toFixed(0)}%</span>
                <span>• Solar load coverage: {(SOLAR_COVERAGE * 100).toFixed(0)}%</span>
                <span>• Battery: 100Ah 48V LiFePO₄ = {BATTERY_KWH} kWh</span>
                <span>• Installation overhead: {(INSTALL_OVERHEAD * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ WHY GET A PRO ASSESSMENT ════ */}
      <section className="section bg-gray-50 border-t border-gray-100" aria-labelledby="pro-assessment-heading">
        <div className="container-main max-w-5xl">
          <div className="text-center mb-12">
            <span className="section-tag"><Sun className="w-4 h-4" /> Go Further</span>
            <h2 id="pro-assessment-heading" className="section-heading">
              Why Get a Professional Assessment?
            </h2>
            <p className="section-subheading">
              The calculator gives you an instant ballpark. A site visit by our engineers gives you accuracy.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: "On-Site Roof Survey",
                desc: "We measure actual roof area, orientation, tilt angle, and shading to design the optimal system layout for your specific property.",
              },
              {
                icon: Calculator,
                title: "Precise Load Analysis",
                desc: "Our engineers analyse your electricity bills and appliance load profile to precisely size the system for your consumption pattern.",
              },
              {
                icon: CheckCircle2,
                title: "Guaranteed Fixed Quote",
                desc: "Receive a detailed proposal with exact equipment specs, confirmed installation cost, and realistic ROI timeline — with no hidden charges.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 group">
                <div className="w-11 h-11 bg-green-50 group-hover:bg-green-600 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-green-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2 font-heading">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/quote" className="btn-primary text-base px-8 py-4">
              Get Free Professional Quote <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
