import type { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://gpsf.datacolabx.com"
).replace(/\/$/, "");

const PUBLIC_ROUTES = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.8 },
  { path: "/plenary", changeFrequency: "monthly", priority: 0.8 },
  { path: "/working-groups", changeFrequency: "weekly", priority: 0.9 },
  { path: "/publication", changeFrequency: "weekly", priority: 0.8 },
  { path: "/new-update", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
