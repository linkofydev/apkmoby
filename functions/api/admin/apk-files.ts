import type { R2Env } from '../../_shared/r2';
import { json, requireAdmin } from '../../_shared/auth';
import { deleteApkFile, listApkFiles } from '../../_shared/r2';

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
