import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Served at https://afsona.tj/sitemap.xml through a Vercel rewrite, so search engines
// always get the current list of products, brands and articles.
const SITE_URL = "https://afsona.tj";

const STATIC_PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/catalog", priority: "0.9", changefreq: "daily" },
  { path: "/brands", priority: "0.7", changefreq: "weekly" },
  { path: "/tinting", priority: "0.7", changefreq: "monthly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/contacts", priority: "0.6", changefreq: "monthly" },
  { path: "/news", priority: "0.5", changefreq: "weekly" },
  { path: "/portfolio", priority: "0.5", changefreq: "weekly" },
];

// Category pages live on fixed routes (see src/App.tsx); keyed by DB category slug
const CATEGORY_ROUTES: Record<string, string> = {
  "paints-and-coatings": "/paints-coatings",
  "adhesives-sealants": "/adhesives-sealants",
  "primers-preparatory": "/primers",
  "putties-leveling": "/putties-leveling",
  "decorative-coatings": "/decorative-coatings",
  "tints-thinners": "/tints-thinners",
  "waterproofing": "/waterproofing",
  "brushes-tools": "/brushes-tools",
  "rollers": "/rollers",
  "spatulas-accessories": "/spatulas-accessories",
  "wall-paints": "/wall-paints",
  "ceiling-paints": "/ceiling-paints",
  "facade-paints": "/facade-paints",
  "tools": "/tools",
};

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const urlEntry = (path: string, opts: { lastmod?: string | null; priority: string; changefreq: string }) =>
  `  <url>\n    <loc>${escapeXml(SITE_URL + path)}</loc>\n` +
  (opts.lastmod ? `    <lastmod>${opts.lastmod.slice(0, 10)}</lastmod>\n` : "") +
  `    <changefreq>${opts.changefreq}</changefreq>\n    <priority>${opts.priority}</priority>\n  </url>`;

serve(async () => {
  try {
    // Only public data is read, so the anon key and its row-level security are enough
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const [products, categories, brands, news, portfolio] = await Promise.all([
      supabase.from("products").select("id, updated_at").or("archived.is.null,archived.eq.false"),
      supabase.from("categories").select("slug"),
      supabase.from("brands").select("slug, updated_at"),
      supabase.from("news").select("slug, updated_at").eq("published", true),
      supabase.from("portfolio").select("slug, updated_at").eq("published", true),
    ]);

    const entries: string[] = STATIC_PAGES.map((p) => urlEntry(p.path, p));

    for (const c of categories.data ?? []) {
      const route = CATEGORY_ROUTES[c.slug];
      if (route) entries.push(urlEntry(route, { priority: "0.8", changefreq: "weekly" }));
    }
    for (const b of brands.data ?? []) {
      if (b.slug) entries.push(urlEntry(`/brands/${b.slug}`, { lastmod: b.updated_at, priority: "0.6", changefreq: "weekly" }));
    }
    for (const p of products.data ?? []) {
      entries.push(urlEntry(`/product/${p.id}`, { lastmod: p.updated_at, priority: "0.8", changefreq: "weekly" }));
    }
    for (const n of news.data ?? []) {
      if (n.slug) entries.push(urlEntry(`/news/${n.slug}`, { lastmod: n.updated_at, priority: "0.5", changefreq: "monthly" }));
    }
    for (const p of portfolio.data ?? []) {
      if (p.slug) entries.push(urlEntry(`/portfolio/${p.slug}`, { lastmod: p.updated_at, priority: "0.5", changefreq: "monthly" }));
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("sitemap error:", error instanceof Error ? error.message : error);
    return new Response("Sitemap unavailable", { status: 500 });
  }
});
