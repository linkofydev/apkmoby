import type { AstroIntegration } from 'astro';

const ENDPOINT = 'https://api.indexnow.org/indexnow';

export default function indexNow(): AstroIntegration {
  return {
    name: 'indexnow',
    hooks: {
      'astro:build:done': async ({ pages, logger }) => {
        if (process.env.INDEXNOW_ENABLED !== 'true') {
          logger.info('IndexNow skipped. Set INDEXNOW_ENABLED=true to ping after build.');
          return;
        }

        const site = (process.env.PUBLIC_SITE_URL || 'https://apkmoby.com').replace(/\/$/, '');
        const host = new URL(site).host;
        const key = process.env.INDEXNOW_KEY || '7f3c9a1e8b4d2f6a0c5e9b1d3f7a2c4e';
        const urlList = pages
          .map((page) => {
            const pathname = page.pathname.replace(/^\//, '');
            return `${site}/${pathname}`.replace(/([^:]\/)\/+/g, '$1');
          })
          .filter((url) => !url.includes('/admin') && !url.includes('/api/'));

        if (urlList.length === 0) {
          logger.info('IndexNow: no URLs to submit.');
          return;
        }

        const payload = {
          host,
          key,
          keyLocation: `${site}/${key}.txt`,
          urlList,
        };

        try {
          const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload),
          });
          if (res.ok || res.status === 202) {
            logger.info(`IndexNow submitted ${urlList.length} URLs (${res.status}).`);
          } else {
            logger.warn(`IndexNow failed: ${res.status} ${res.statusText}`);
          }
        } catch (error) {
          logger.warn(`IndexNow request error: ${error instanceof Error ? error.message : error}`);
        }
      },
    },
  };
}
