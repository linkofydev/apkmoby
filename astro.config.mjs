// @ts-check
import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import indexNow from './src/integrations/indexnow.ts';
import trailingSlashRedirects from './src/integrations/trailing-slash-redirects.ts';

const site = process.env.PUBLIC_SITE_URL || 'https://apkmoby.com';

// Tailwind: @astrojs/tailwind is deprecated and does not support Astro 6/7.
// Use the official Tailwind v4 Vite plugin instead (see src/styles/global.css).

export default defineConfig({
  site,
  output: 'static',
  // Cloudflare Pages: directory builds (page/index.html) force /page → /page/ 308s.
  // File builds (page.html) serve /page with HTTP 200 — required for clean Google indexing.
  trailingSlash: 'never',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  image: {
    remotePatterns: [{ protocol: 'https' }, { protocol: 'http' }],
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin') && !page.includes('/api/') && !page.includes('/download/'),
      serialize(item) {
        const url = new URL(item.url);
        let path = url.pathname.replace(/\/$/, '') || '/';
        // Homepage canonical always ends with /
        if (path === '/') {
          item.url = `${site.replace(/\/$/, '')}/`;
        } else {
          url.pathname = path;
          item.url = url.toString();
        }
        item.lastmod = new Date().toISOString();
        if (path === '/') {
          item.changefreq = ChangeFreqEnum.DAILY;
          item.priority = 1;
        } else if (path.startsWith('/download/')) {
          item.changefreq = ChangeFreqEnum.WEEKLY;
          item.priority = 0.6;
        } else if (path.startsWith('/category/') || path === '/games' || path === '/apps') {
          item.changefreq = ChangeFreqEnum.DAILY;
          item.priority = 0.8;
        } else if (path === '/about' || path === '/privacy' || path === '/dmca') {
          item.changefreq = ChangeFreqEnum.MONTHLY;
          item.priority = 0.3;
        } else {
          item.changefreq = ChangeFreqEnum.WEEKLY;
          item.priority = 0.9;
        }
        return item;
      },
    }),
    indexNow(),
    trailingSlashRedirects(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
});
