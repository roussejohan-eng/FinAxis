import type { MetadataRoute } from "next";

const siteUrl = "https://finaxis.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/tarifs", "/contact-b2b"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
