import type { CmsEnv } from '../../_shared/auth';
import { createSessionCookie, json, verifyLogin } from '../../_shared/auth';

export const onRequestPost: PagesFunction<CmsEnv> = async ({ request, env }) => {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const ok = await verifyLogin(env, body.email || '', body.password || '');
  if (!ok) return json({ error: 'Invalid email or password' }, { status: 401 });
  const cookie = await createSessionCookie(env, (body.email || '').trim().toLowerCase());
  return json(
    { ok: true },
    {
      status: 200,
      headers: { 'Set-Cookie': cookie },
    },
  );
};
