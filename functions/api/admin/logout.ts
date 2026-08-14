import type { CmsEnv } from '../../_shared/auth';
import { clearSessionCookie, json } from '../../_shared/auth';

export const onRequestPost: PagesFunction<CmsEnv> = async () => {
  return json({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookie() } });
};
