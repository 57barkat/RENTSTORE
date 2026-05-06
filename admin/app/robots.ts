import type { MetadataRoute } from "next";

import { toAbsoluteUrl } from "@/app/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/observability",
          "/properties",
          "/reports",
          "/users",
          "/login",
        ],
      },
    ],
    sitemap: toAbsoluteUrl("/sitemap.xml"),
    host: toAbsoluteUrl("/"),
  };
}
