import type { MetadataRoute } from "next";

const siteUrl = "https://finaxis.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/wizard/", "/dashboard/", "/projects"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
