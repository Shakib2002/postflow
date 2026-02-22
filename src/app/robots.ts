import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://postflow.app";
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/login", "/signup", "/capture"],
                disallow: [
                    "/dashboard",
                    "/compose",
                    "/analytics",
                    "/billing",
                    "/team",
                    "/settings",
                    "/approvals",
                    "/posts",
                    "/leads",
                    "/comments",
                    "/calendar",
                    "/api/",
                ],
            },
        ],
        sitemap: `${appUrl}/sitemap.xml`,
    };
}
