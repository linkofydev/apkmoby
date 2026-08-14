// @ts-check
import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import indexNow from './src/integrations/indexnow.ts';

const site = process.env.PUBLIC_SITE_URL || 'https://apkmoby.com';

// Tailwind: @astrojs/tailwind is deprecated and does not support Astro 6/7.
// Use the official Tailwind v4 Vite plugin instead (see src/styles/global.css).

export default defineConfig({
  site,
  output: 'static',
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
        const path = new URL(item.url).pathname;
        item.lastmod = new Date().toISOString();
        if (path === '/' || path === '') {
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
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'always',
  },
});
