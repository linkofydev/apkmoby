import type { AstroIntegration } from 'astro';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Cloudflare Pages directory URLs 308 to /path/. With file builds we want the
 * opposite: /path/ → 301 /path so Google only sees one canonical URL.
 */
export default function trailingSlashRedirects(): AstroIntegration {
  return {
    name: 'trailing-slash-redirects',
    hooks: {
      'astro:build:done': async ({ dir, pages, logger }) => {
        const redirectsPath = join(dir.pathname, '_redirects');
        const lines: string[] = [];

        if (existsSync(redirectsPath)) {
          lines.push(readFileSync(redirectsPath, 'utf8').trimEnd(), '');
        }

        const seen = new Set<string>();
        for (const page of pages) {
          let path = page.pathname.startsWith('/') ? page.pathname : `/${page.pathname}`;
          path = path.replace(/\/+$/, '') || '/';
          if (path === '/' || path.includes('.') || path === '/404') continue;
          if (path.startsWith('/admin') || path.startsWith('/api/')) continue;
          const from = `${path}/`;
          if (seen.has(from)) continue;
          seen.add(from);
          lines.push(`${from} ${path} 301`);
        }

        writeFileSync(redirectsPath, `${lines.join('\n')}\n`, 'utf8');
        logger.info(`Wrote ${seen.size} trailing-slash → canonical redirects`);
      },
    },
  };
}
