import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://frogface.space";
  const now = new Date().toISOString();

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/quests`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/player`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/studio`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/pipeline`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/tasks`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
  ];
}
