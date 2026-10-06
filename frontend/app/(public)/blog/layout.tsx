import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar Energy Blog & Guides | Al Rehman Solar System & UPS",
  description:
    "Expert solar guides, electricity bill savings tips, net metering walkthroughs, battery storage advice, and solar system sizing for homeowners in Lahore and Pakistan.",
  openGraph: {
    title: "Solar Energy Blog & Guides | Al Rehman Solar System & UPS",
    description:
      "Expert solar guides, electricity bill savings tips, net metering walkthroughs, battery storage advice, and solar system sizing for homeowners in Lahore and Pakistan.",
    type: "website",
    url: "https://alrehmansolars.com/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
