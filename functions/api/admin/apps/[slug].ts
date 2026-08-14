import type { CmsEnv } from '../../../_shared/auth';
import { json, requireAdmin } from '../../../_shared/auth';
import { deleteApp, getApp, saveApp, type ApkPayload } from '../../../_shared/github';

export const onRequestGet: PagesFunction<CmsEnv> = async ({ request, env, params }) => {
  const auth = await requireAdmin(env, request);
  if (auth instanceof Response) return auth;
  const slug = String(params.slug || '');
  try {
    const entry = await getApp(env, slug);
    if (!entry) return json({ error: 'Not found' }, { status: 404 });
    return json(entry);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Read failed' }, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<CmsEnv> = async ({ request, env, params }) => {
  const auth = await requireAdmin(env, request);
  if (auth instanceof Response) return auth;
  const slug = String(params.slug || '');
  try {
    const payload = (await request.json()) as ApkPayload & { sha?: string };
    payload.slug = slug;
    payload.updatedDate = payload.updatedDate || new Date().toISOString().slice(0, 10);
    await saveApp(env, payload, payload.sha);
    return json({ ok: true, slug });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Save failed' }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<CmsEnv> = async ({ request, env, params }) => {
  const auth = await requireAdmin(env, request);
  if (auth instanceof Response) return auth;
  const slug = String(params.slug || '');
  try {
    const existing = await getApp(env, slug);
    if (existing) return json({ error: 'Slug already exists' }, { status: 409 });
    const payload = (await request.json()) as ApkPayload;
    payload.slug = slug;
    payload.publishDate = payload.publishDate || new Date().toISOString().slice(0, 10);
    payload.updatedDate = payload.updatedDate || payload.publishDate;
    await saveApp(env, payload);
    return json({ ok: true, slug }, { status: 201 });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Create failed' }, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<CmsEnv> = async ({ request, env, params }) => {
  const auth = await requireAdmin(env, request);
  if (auth instanceof Response) return auth;
  const slug = String(params.slug || '');
  const url = new URL(request.url);
  const sha = url.searchParams.get('sha') || '';
  if (!sha) return json({ error: 'Missing sha' }, { status: 400 });
  try {
    await deleteApp(env, slug, sha);
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Delete failed' }, { status: 500 });
  }
};
