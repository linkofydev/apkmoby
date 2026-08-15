/**
 * Public download edge for https://dl.apkmoby.com
 * Serves R2 objects under /apk/* with X-Robots-Tag: noindex, nofollow
 * and a strict robots.txt so crawlers do not index APK URLs.
 */
export interface Env {
  APK_BUCKET: R2Bucket;
}

const APK_MIME = 'application/vnd.android.package-archive';
const ROBOTS = 'noindex, nofollow';

const ROBOTS_TXT = `User-agent: *
Disallow: /

User-agent: Googlebot
Disallow: /

User-agent: Googlebot-Image
Disallow: /

# APK files on this host must never be indexed.
`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/robots.txt') {
      return new Response(ROBOTS_TXT, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'X-Robots-Tag': ROBOTS,
        },
      });
    }

    if (url.pathname === '/' || url.pathname === '') {
      return new Response('Apk Moby downloads', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Robots-Tag': ROBOTS,
        },
      });
    }

    if (!url.pathname.startsWith('/apk/')) {
      return new Response('Not found', {
        status: 404,
        headers: { 'X-Robots-Tag': ROBOTS },
      });
    }

    const key = url.pathname.replace(/^\/+/, '');
    if (key.includes('..') || key.length > 512) {
      return new Response('Bad request', {
        status: 400,
        headers: { 'X-Robots-Tag': ROBOTS },
      });
    }

    const object = await env.APK_BUCKET.get(key);
    if (!object) {
      return new Response('File not found', {
        status: 404,
        headers: { 'X-Robots-Tag': ROBOTS },
      });
    }

    const headers = new Headers();
    headers.set('X-Robots-Tag', ROBOTS);
    headers.set('Content-Type', object.httpMetadata?.contentType || APK_MIME);
    headers.set(
      'Content-Disposition',
      object.httpMetadata?.contentDisposition ||
        `attachment; filename="${key.split('/').pop() || 'app.apk'}"`,
    );
    headers.set(
      'Cache-Control',
      object.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable',
    );
    headers.set('ETag', object.httpEtag);
    if (object.size != null) headers.set('Content-Length', String(object.size));

    if (request.method === 'HEAD') {
      return new Response(null, { status: 200, headers });
    }

    return new Response(object.body, { status: 200, headers });
  },
};
