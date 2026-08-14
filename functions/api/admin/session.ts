import type { CmsEnv } from '../../_shared/auth';
import { json, readSession } from '../../_shared/auth';

export const onRequestGet: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const session = await readSession(env, request);
  if (!session) return json({ ok: false }, { status: 401 });
  return json({ ok: true, email: session.email });
};
