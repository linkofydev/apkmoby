import type { R2Env } from '../../_shared/r2';
import { json, requireAdmin } from '../../_shared/auth';
import { deleteApkFile, listApkFiles, putApkBodyToR2 } from '../../_shared/r2';

/** GET /api/admin/apk-files — list APK objects in R2 */
export const onRequestGet: PagesFunction<R2Env> = async ({ request, env }) => {
  const auth = await requireAdmin(env, request);
  if (auth instanceof Response) return auth;
  try {
    const files = await listApkFiles(env);
    return json({ files });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'List failed' }, { status: 500 });
  }
};

/** POST /api/admin/apk-files — multipart local APK upload (fields: file, optional fileName) */
export const onRequestPost: PagesFunction<R2Env> = async ({ request, env }) => {
  const auth = await requireAdmin(env, request);
  if (auth instanceof Response) return auth;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Invalid multipart form' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return json({ error: 'APK file is required' }, { status: 400 });
  }
  const nameHint = String(form.get('fileName') || file.name || '').trim();
  if (!nameHint.toLowerCase().endsWith('.apk') && !file.name.toLowerCase().endsWith('.apk')) {
    return json({ error: 'Only .apk files are allowed' }, { status: 400 });
  }
  if (file.size > 512 * 1024 * 1024) {
    return json({ error: 'APK larger than 512MB is not supported' }, { status: 400 });
  }

  try {
    const body = typeof file.stream === 'function' ? file.stream() : await file.arrayBuffer();
    const result = await putApkBodyToR2(env, body, nameHint || file.name, {
      bytes: file.size,
      source: 'local-upload',
    });
    return json({
      ok: true,
      status: 'Success',
      key: result.key,
      fileName: result.fileName,
      publicUrl: result.publicUrl,
      bytes: result.bytes ?? file.size,
      etag: result.etag,
      via: result.via,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 });
  }
};

/** DELETE /api/admin/apk-files?fileName=foo.apk — remove from R2 */
export const onRequestDelete: PagesFunction<R2Env> = async ({ request, env }) => {
  const auth = await requireAdmin(env, request);
  if (auth instanceof Response) return auth;
  const fileName = new URL(request.url).searchParams.get('fileName') || '';
  if (!fileName) return json({ error: 'fileName is required' }, { status: 400 });
  try {
    const result = await deleteApkFile(env, fileName);
    return json({ ok: true, ...result });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Delete failed' }, { status: 500 });
  }
};
