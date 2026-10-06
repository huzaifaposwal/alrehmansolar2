import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alrehmansolars.com"),
  title: {
    default: "Al Rehman Solar System & UPS — Lahore, Pakistan",
    template: "%s | Al Rehman Solar",
  },
  description:
    "Professional solar panel installation, hybrid solar systems, UPS solutions and solar inverters in Lahore, Pakistan. Get a free quote today.",
  keywords: [
    "solar panels Lahore",
    "solar installation Lahore",
    "solar system Lahore",
    "hybrid solar system Lahore",
    "UPS Lahore",
    "solar inverter Lahore",
    "solar battery Lahore",
    "on-grid solar Lahore",
    "off-grid solar Lahore",
  ],
  authors: [{ name: "Al Rehman Solar System & UPS" }],
  creator: "Al Rehman Solar System & UPS",
  publisher: "Al Rehman Solar System & UPS",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://alrehmansolars.com",
    siteName: "Al Rehman Solar System & UPS",
    title: "Al Rehman Solar System & UPS — Lahore, Pakistan",
    description:
      "Professional solar panel installation, hybrid solar systems, UPS solutions in Lahore, Pakistan.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Al Rehman Solar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Al Rehman Solar System & UPS",
    description: "Professional solar solutions in Lahore, Pakistan.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://alrehmansolars.com",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a2340",
              color: "#fff",
              borderRadius: "12px",
            },
            success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
