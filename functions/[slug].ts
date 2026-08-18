import type { CmsEnv } from './_shared/auth';

/** Fallback when the static article HTML is not deployed yet (avoids 404 after CMS publish). */
export const onRequestGet: PagesFunction<CmsEnv> = async ({ params, env }) => {
  const slug = String(params.slug || '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return new Response('Not found', { status: 404 });
  }

  const repo = env.GITHUB_REPO || 'linkofydev/apkmoby';
  const branch = env.GITHUB_BRANCH || 'main';
  const headers: Record<string, string> = { 'User-Agent': 'apkmoby-cms' };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

  const res = await fetch(
    `https://raw.githubusercontent.com/${repo}/${branch}/src/content/apk/${slug}.md`,
    { headers },
  );
  if (!res.ok) return new Response('Not found', { status: 404 });

  const raw = await res.text();
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return new Response('Not found', { status: 404 });
  if (/^draft:\s*true\s*$/m.test(fm[1])) return new Response('Not found', { status: 404 });

  const title = (fm[1].match(/^metaTitle:\s*(.*)$/m) || fm[1].match(/^title:\s*(.*)$/m) || [])[1] || slug;
  const clean = String(title).replace(/^["']|["']$/g, '').trim();

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex, follow" />
  <meta http-equiv="refresh" content="8" />
  <link rel="canonical" href="https://apkmoby.com/${slug}" />
  <title>${clean}</title>
</head>
<body>
  <p>This article is publishing to the live site. The page will refresh automatically.</p>
  <p><a href="/${slug}">https://apkmoby.com/${slug}</a></p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      Refresh: '8',
    },
  });
};
