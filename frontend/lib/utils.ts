import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format PKR currency */
export function formatPKR(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format number with commas */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-PK").format(n);
}

/** Generate slug from string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** Truncate text to n chars */
export function truncate(text: string, n: number): string {
  if (text.length <= n) return text;
  return text.slice(0, n).trim() + "…";
}

/** Format date for display */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Get WhatsApp link */
export function getWhatsAppLink(number: string, message?: string): string {
  const msg = message ? encodeURIComponent(message) : encodeURIComponent("Hello! I'm interested in your solar solutions.");
  return `https://wa.me/${number}?text=${msg}`;
}

/** Estimate read time from content */
export function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Safe parse JSON with fallback */
export function safeJSON<T>(str: string | undefined | null, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
