import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /admin-panel
Disallow: /admin-panel/
Disallow: /api/admin
Disallow: /api/remote-upload-apk

User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /admin-panel
Disallow: /api/admin
Disallow: /api/remote-upload-apk

User-agent: GPTBot
Allow: /

Sitemap: ${sitemapURL.href}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
