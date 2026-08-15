export interface CmsEnv {
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD_HASH: string;
  ADMIN_PASSWORD_SALT: string;
  SESSION_SECRET: string;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH?: string;
  CLOUDFLARE_R2_ACCOUNT_ID?: string;
  CLOUDFLARE_R2_ACCESS_KEY_ID?: string;
  CLOUDFLARE_R2_SECRET_ACCESS_KEY?: string;
  CLOUDFLARE_R2_BUCKET_NAME?: string;
  DOWNLOAD_DOMAIN?: string;
  APK_BUCKET?: R2Bucket;
}

const COOKIE = 'moby_admin';
const MAX_AGE = 60 * 60 * 24 * 7;

export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyLogin(env: CmsEnv, email: string, password: string): Promise<boolean> {
  const expectedEmail = (env.ADMIN_EMAIL || '').trim().toLowerCase();
  const gotEmail = (email || '').trim().toLowerCase();
  if (!expectedEmail || !timingSafeEqual(gotEmail, expectedEmail)) return false;
  if (!env.ADMIN_PASSWORD_HASH || !env.ADMIN_PASSWORD_SALT) return false;
  const digest = await sha256Hex(`${env.ADMIN_PASSWORD_SALT}${password}`);
  return timingSafeEqual(digest, env.ADMIN_PASSWORD_HASH.toLowerCase());
}

export async function createSessionCookie(env: CmsEnv, email: string): Promise<string> {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = btoa(JSON.stringify({ email, exp }));
  const sig = await hmacHex(env.SESSION_SECRET, payload);
  const value = `${payload}.${sig}`;
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function readSession(env: CmsEnv, request: Request): Promise<{ email: string } | null> {
  const raw = request.headers.get('Cookie') || '';
  const match = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return null;
  const [payload, sig] = match[1].split('.');
  if (!payload || !sig || !env.SESSION_SECRET) return null;
  const expected = await hmacHex(env.SESSION_SECRET, payload);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(atob(payload)) as { email?: string; exp?: number };
    if (!data.email || !data.exp || data.exp < Date.now()) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export async function requireAdmin(env: CmsEnv, request: Request): Promise<Response | { email: string }> {
  const session = await readSession(env, request);
  if (!session) return json({ error: 'Unauthorized' }, { status: 401 });
  return session;
}
