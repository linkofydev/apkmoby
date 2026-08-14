import type { CmsEnv } from '../../_shared/auth';
import { json, requireAdmin } from '../../_shared/auth';
import { uploadAsset } from '../../_shared/github';

export const onRequestPost: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const auth = await requireAdmin(env, request);
  if (auth instanceof Response) return auth;
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'No file' }, { status: 400 });
  if (file.size > 5_000_000) return json({ error: 'Max file size is 5MB' }, { status: 400 });
  try {
    const bytes = await file.arrayBuffer();
    const url = await uploadAsset(env, file.name, bytes, file.type || 'application/octet-stream');
    return json({ url });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 });
  }
};
