import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://alrehmansolars.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/solutions/residential-solar`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/solutions/commercial-solar`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/solutions/industrial-solar`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/solutions/hybrid`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/solutions/on-grid`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/solutions/off-grid`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/solutions/ups`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/products`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/calculator`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/quote`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
