import type { APIRoute } from 'astro';
import { getApks, uniqueCategories } from '../lib/apk';
import { categorySlug, SITE } from '../config';

export const prerender = true;

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function entry(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/** Single flat sitemap so Google + browsers see articles directly at /sitemap.xml */
export const GET: APIRoute = async () => {
  const base = (SITE.url || 'https://apkmoby.com').replace(/\/$/, '');
  const now = new Date().toISOString();
  const apps = await getApks();
  const categories = uniqueCategories(apps);

  const urls: string[] = [
    entry(`${base}/`, now, 'daily', '1.0'),
    entry(`${base}/games`, now, 'daily', '0.8'),
    entry(`${base}/apps`, now, 'daily', '0.8'),
    entry(`${base}/about`, now, 'monthly', '0.3'),
    entry(`${base}/privacy`, now, 'monthly', '0.3'),
    entry(`${base}/dmca`, now, 'monthly', '0.3'),
  ];

  for (const cat of categories) {
    urls.push(entry(`${base}/category/${categorySlug(cat)}`, now, 'daily', '0.8'));
  }

  for (const app of apps) {
    const lastmod = (app.data.updatedDate || app.data.publishDate || new Date()).toISOString();
    urls.push(entry(`${base}/${app.data.slug}`, lastmod, 'weekly', '0.9'));
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
