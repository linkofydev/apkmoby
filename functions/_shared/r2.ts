import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { CmsEnv } from './auth';

export type R2Env = CmsEnv & {
  CLOUDFLARE_R2_ACCOUNT_ID?: string;
  CLOUDFLARE_R2_ACCESS_KEY_ID?: string;
  CLOUDFLARE_R2_SECRET_ACCESS_KEY?: string;
  CLOUDFLARE_R2_BUCKET_NAME?: string;
  DOWNLOAD_DOMAIN?: string;
  /** Optional native R2 binding (preferred when configured in wrangler). */
  APK_BUCKET?: R2Bucket;
};

const APK_MIME = 'application/vnd.android.package-archive';
const ROBOTS = 'noindex, nofollow';

export function downloadDomain(env: R2Env): string {
  return (env.DOWNLOAD_DOMAIN || 'https://dl.apkmoby.com').replace(/\/$/, '');
}

export function publicApkUrl(env: R2Env, fileName: string): string {
  return `${downloadDomain(env)}/apk/${fileName}`;
}

export function sanitizeApkFileName(input: string): string {
  const raw = String(input || '').trim().toLowerCase();
  const base = raw.split(/[\\/]/).pop() || '';
  const cleaned = base
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!cleaned || cleaned === '.apk' || cleaned.includes('..')) {
    throw new Error('Invalid file name');
  }
  return cleaned.endsWith('.apk') ? cleaned : `${cleaned}.apk`;
}

/** Block obvious SSRF targets before fetching a remote APK URL. */
export function assertSafeRemoteUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(String(raw || '').trim());
  } catch {
    throw new Error('Invalid remote URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Remote URL must be http or https');
  }
  const host = url.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host === 'metadata.google.internal'
  ) {
    throw new Error('Remote host is not allowed');
  }
  // Private / link-local IPv4
  if (/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) {
    throw new Error('Private IP remotes are not allowed');
  }
  return url;
}

function requireS3Config(env: R2Env) {
  const accountId = env.CLOUDFLARE_R2_ACCOUNT_ID?.trim();
  const accessKeyId = env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim();
  const bucket = env.CLOUDFLARE_R2_BUCKET_NAME?.trim();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      'R2 is not configured. Set CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME.',
    );
  }
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

export function createR2S3Client(env: R2Env): S3Client {
  const { accountId, accessKeyId, secretAccessKey } = requireS3Config(env);
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

export type RemoteUploadResult = {
  key: string;
  fileName: string;
  publicUrl: string;
  bytes?: number;
  etag?: string;
  via: 'r2-binding' | 's3-api';
};

/**
 * Stream remoteUrl → R2 key `apk/<fileName>` without buffering the full APK in memory.
 * Prefers native R2 binding when present; otherwise uses S3-compatible PutObject.
 */
export async function streamRemoteApkToR2(
  env: R2Env,
  remoteUrl: string,
  fileNameInput: string,
): Promise<RemoteUploadResult> {
  const fileName = sanitizeApkFileName(fileNameInput);
  const key = `apk/${fileName}`;
  const source = assertSafeRemoteUrl(remoteUrl);

  const upstream = await fetch(source.toString(), {
    redirect: 'follow',
    headers: {
      'User-Agent': 'ApkMoby-RemoteUploader/1.0',
      Accept: '*/*',
    },
  });
  if (!upstream.ok) {
    throw new Error(`Remote download failed (${upstream.status})`);
  }
  if (!upstream.body) {
    throw new Error('Remote response body is empty');
  }

  const contentLength = upstream.headers.get('content-length');
  const bytes = contentLength ? Number(contentLength) : undefined;
  if (bytes != null && Number.isFinite(bytes) && bytes > 512 * 1024 * 1024) {
    throw new Error('APK larger than 512MB is not supported via this uploader');
  }

  // Prefer Workers R2 binding (true stream, lighter on bundle/CPU).
  if (env.APK_BUCKET) {
    const put = await env.APK_BUCKET.put(key, upstream.body, {
      httpMetadata: {
        contentType: APK_MIME,
        contentDisposition: `attachment; filename="${fileName}"`,
        cacheControl: 'public, max-age=31536000, immutable',
      },
      customMetadata: {
        'x-robots-tag': ROBOTS,
        source: source.hostname,
      },
    });
    return {
      key,
      fileName,
      publicUrl: publicApkUrl(env, fileName),
      bytes: put.size,
      etag: put.etag,
      via: 'r2-binding',
    };
  }

  const { bucket } = requireS3Config(env);
  const client = createR2S3Client(env);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: upstream.body,
    ContentType: APK_MIME,
    ContentDisposition: `attachment; filename="${fileName}"`,
    CacheControl: 'public, max-age=31536000, immutable',
    // Stored as x-amz-meta-*; public noindex is also enforced on dl.apkmoby.com Worker / Transform Rules.
    Metadata: {
      'x-robots-tag': ROBOTS,
      source: source.hostname,
    },
    ...(bytes && Number.isFinite(bytes) ? { ContentLength: bytes } : {}),
  });

  const out = await client.send(command);
  return {
    key,
    fileName,
    publicUrl: publicApkUrl(env, fileName),
    bytes,
    etag: out.ETag,
    via: 's3-api',
  };
}
