import type { R2Env } from '../_shared/r2';
import { json, requireAdmin } from '../_shared/auth';
import { streamRemoteApkToR2 } from '../_shared/r2';

/**
 * POST /api/remote-upload-apk
 * Body: { remoteUrl: string, fileName: string }
 * Auth: admin session cookie (same as /api/admin/*)
 */
export const onRequestPost: PagesFunction<R2Env> = async ({ request, env }) => {
  const auth = await requireAdmin(env, request);
  if (auth instanceof Response) return auth;

  let body: { remoteUrl?: string; fileName?: string };
  try {
    body = (await request.json()) as { remoteUrl?: string; fileName?: string };
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const remoteUrl = String(body.remoteUrl || '').trim();
  const fileName = String(body.fileName || '').trim();
  if (!remoteUrl || !fileName) {
    return json({ error: 'remoteUrl and fileName are required' }, { status: 400 });
  }

  try {
    const result = await streamRemoteApkToR2(env, remoteUrl, fileName);
    return json({
      ok: true,
      status: 'Success',
      key: result.key,
      fileName: result.fileName,
      publicUrl: result.publicUrl,
      bytes: result.bytes,
      etag: result.etag,
      via: result.via,
      robots: 'noindex, nofollow',
    });
  } catch (error) {
    return json(
      {
        ok: false,
        status: 'Error',
        error: error instanceof Error ? error.message : 'Remote upload failed',
      },
      { status: 500 },
    );
  }
};
