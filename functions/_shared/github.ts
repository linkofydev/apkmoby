export interface FaqItem {
  q: string;
  a: string;
}

export interface ApkPayload {
  title: string;
  metaTitle: string;
  metaDescription: string;
  appName: string;
  slug: string;
  icon: string;
  category: string;
  version: string;
  size: string;
  developer: string;
  packageName: string;
  reqAndroid: string;
  totalDownloads: string | number;
  ratingValue: number;
  ratingCount: number;
  modFeatures: string[];
  modHtml?: string;
  summary?: string;
  faqs?: FaqItem[];
  downloadUrl: string;
  publishDate: string;
  updatedDate: string;
  featuredImage: string;
  screenshots: string[];
  body: string;
  draft?: boolean;
}

function yamlEscape(value: string | number | boolean | null | undefined): string {
  // Always quote strings so YAML never coerces versions like 1 / 4.0 into numbers.
  return JSON.stringify(String(value ?? ''));
}

function yamlList(key: string, items: string[]): string[] {
  const cleaned = (items || []).map((item) => String(item || '').trim()).filter(Boolean);
  if (!cleaned.length) return [`${key}: []`];
  return [key + ':', ...cleaned.map((item) => `  - ${yamlEscape(item)}`)];
}

export function toMarkdown(data: ApkPayload): string {
  const features = (data.modFeatures || []).map((f) => String(f || '').trim()).filter(Boolean);
  const shots = (data.screenshots || []).map((s) => String(s || '').trim()).filter(Boolean);
  const faqs = (data.faqs || [])
    .map((item) => ({ q: String(item?.q || '').trim(), a: String(item?.a || '').trim() }))
    .filter((item) => item.q && item.a);
  const isDraft = !!data.draft;
  const lines = [
    '---',
    `title: ${yamlEscape(data.title)}`,
    `metaTitle: ${yamlEscape(data.metaTitle)}`,
    `metaDescription: ${yamlEscape(data.metaDescription)}`,
    `appName: ${yamlEscape(data.appName)}`,
    `slug: ${yamlEscape(data.slug)}`,
    `icon: ${yamlEscape(data.icon)}`,
    `category: ${yamlEscape(data.category)}`,
    `version: ${yamlEscape(data.version)}`,
    `size: ${yamlEscape(data.size)}`,
    `developer: ${yamlEscape(data.developer)}`,
    `packageName: ${yamlEscape(data.packageName)}`,
    `reqAndroid: ${yamlEscape(data.reqAndroid)}`,
    `totalDownloads: ${yamlEscape(data.totalDownloads)}`,
    `ratingValue: ${Number(data.ratingValue) || 0}`,
    `ratingCount: ${Number(data.ratingCount) || 0}`,
    ...yamlList('modFeatures', features),
    ...(data.modHtml ? [`modHtml: ${yamlEscape(data.modHtml)}`] : []),
    `summary: ${yamlEscape(data.summary || '')}`,
    `faqs: ${JSON.stringify(faqs)}`,
    `downloadUrl: ${yamlEscape(data.downloadUrl)}`,
    `publishDate: ${yamlEscape(data.publishDate)}`,
    `updatedDate: ${yamlEscape(data.updatedDate)}`,
    `featuredImage: ${yamlEscape(data.featuredImage)}`,
    `draft: ${isDraft ? 'true' : 'false'}`,
    ...yamlList('screenshots', shots),
    '---',
    '',
    (data.body || '').trim(),
    '',
  ];
  return lines.join('\n');
}

export function fromMarkdown(raw: string): ApkPayload {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const fm = match ? match[1] : '';
  const body = match ? match[2].trim() : raw.trim();
  const data: Record<string, unknown> = {};
  let current: string | null = null;
  const lists: Record<string, string[]> = { modFeatures: [], screenshots: [] };

  for (const line of fm.split('\n')) {
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && current) {
      let val = listItem[1].trim();
      if (val === '[]' || val === '""') continue;
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      lists[current] = lists[current] || [];
      lists[current].push(val);
      continue;
    }
    const kv = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (!kv) continue;
    current = kv[1];
    const value = kv[2].trim();
    if (value === '[]') {
      lists[current] = [];
      continue;
    }
    if (value === '') {
      lists[current] = lists[current] || [];
      continue;
    }
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      if (value.startsWith('"')) {
        try {
          data[current] = JSON.parse(value);
        } catch {
          data[current] = value.slice(1, -1);
        }
      } else {
        data[current] = value.slice(1, -1);
      }
    } else if (value.startsWith('[') || value.startsWith('{')) {
      try {
        data[current] = JSON.parse(value);
      } catch {
        data[current] = value;
      }
    } else if (value === 'true' || value === 'false') {
      data[current] = value === 'true';
    } else if (/^\d+(\.\d+)?$/.test(value)) {
      data[current] = Number(value);
    } else {
      data[current] = value;
    }
  }

  const faqsRaw = data.faqs;
  let faqs: FaqItem[] = [];
  if (Array.isArray(faqsRaw)) {
    faqs = faqsRaw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const row = item as { q?: unknown; a?: unknown };
        return { q: String(row.q || '').trim(), a: String(row.a || '').trim() };
      })
      .filter((item): item is FaqItem => !!item && !!item.q && !!item.a);
  }

  return {
    title: String(data.title || ''),
    metaTitle: String(data.metaTitle || ''),
    metaDescription: String(data.metaDescription || ''),
    appName: String(data.appName || ''),
    slug: String(data.slug || ''),
    icon: String(data.icon || ''),
    category: String(data.category || 'Games'),
    version: String(data.version || ''),
    size: String(data.size || ''),
    developer: String(data.developer || ''),
    packageName: String(data.packageName || ''),
    reqAndroid: String(data.reqAndroid || ''),
    totalDownloads: (data.totalDownloads as string | number) ?? '',
    ratingValue: Number(data.ratingValue || 0),
    ratingCount: Number(data.ratingCount || 0),
    modFeatures: lists.modFeatures || [],
    modHtml: data.modHtml ? String(data.modHtml) : undefined,
    summary: String(data.summary || ''),
    faqs,
    downloadUrl: String(data.downloadUrl || ''),
    publishDate: String(data.publishDate || ''),
    updatedDate: String(data.updatedDate || ''),
    featuredImage: String(data.featuredImage || ''),
    screenshots: lists.screenshots || [],
    body,
    draft: data.draft === true || data.draft === 'true',
  };
}

interface GhEnv {
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH?: string;
}

async function gh(env: GhEnv, path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'User-Agent': 'apkmoby-cms',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
  });
  return res;
}

function utf8ToBase64(str: string) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToUtf8(b64: string) {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function apkPath(slug: string) {
  return `src/content/apk/${slug}.md`;
}

export async function listApps(env: GhEnv) {
  const res = await gh(env, `/contents/src/content/apk?ref=${env.GITHUB_BRANCH || 'main'}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list failed (${res.status})`);
  const files = (await res.json()) as { name: string; type: string; path: string }[];
  return files.filter((f) => f.type === 'file' && f.name.endsWith('.md') && !f.name.startsWith('_'));
}

export async function getApp(env: GhEnv, slug: string) {
  const res = await gh(env, `/contents/${apkPath(slug)}?ref=${env.GITHUB_BRANCH || 'main'}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  const file = (await res.json()) as { content: string; sha: string; encoding: string };
  const raw = base64ToUtf8(file.content);
  return { sha: file.sha, data: fromMarkdown(raw) };
}

export async function saveApp(env: GhEnv, data: ApkPayload, sha?: string) {
  const prepared = applyDraftDefaults(data);
  // Hard-block incomplete publishing payloads so public pages stay consistently indexable.
  if (!prepared.draft) {
    const errors: string[] = [];
    if (!String(prepared.metaTitle || '').trim()) errors.push('metaTitle');
    if (!String(prepared.metaDescription || '').trim()) errors.push('metaDescription');
    if (!String(prepared.publishDate || '').trim()) errors.push('publishDate');
    if (!String(prepared.updatedDate || '').trim()) errors.push('updatedDate');
    if (!String(prepared.icon || '').trim() || String(prepared.icon) === '/favicon.svg') errors.push('icon');
    if (!String(prepared.featuredImage || '').trim() || String(prepared.featuredImage).includes('hero-mod-1280'))
      errors.push('featuredImage');
    if (!String(prepared.downloadUrl || '').trim() || String(prepared.downloadUrl) === 'https://apkmoby.com/')
      errors.push('downloadUrl');
    if (errors.length) throw new Error(`Publish blocked: missing/placeholder ${errors.join(', ')}`);
  }
  const message = prepared.draft
    ? sha
      ? `cms: draft update ${prepared.slug}`
      : `cms: draft ${prepared.slug}`
    : sha
      ? `cms: update ${prepared.slug}`
      : `cms: publish ${prepared.slug}`;
  const body = {
    message,
    content: utf8ToBase64(toMarkdown(prepared)),
    branch: env.GITHUB_BRANCH || 'main',
    ...(sha ? { sha } : {}),
  };
  const res = await gh(env, `/contents/${apkPath(prepared.slug)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub save failed (${res.status}): ${err}`);
  }
  return res.json();
}

/** Fill required fields so incomplete drafts still pass the Astro content schema. */
export function applyDraftDefaults(data: ApkPayload): ApkPayload {
  const draft = !!data.draft;
  if (!draft) {
    return { ...data, draft: false };
  }
  const appName = String(data.appName || '').trim() || 'Untitled draft';
  const slug = String(data.slug || '').trim() || 'untitled-draft';
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...data,
    draft: true,
    appName,
    slug,
    title: String(data.title || '').trim() || appName,
    metaTitle: String(data.metaTitle || '').trim() || appName,
    metaDescription:
      String(data.metaDescription || '').trim() || 'Draft article — not published on the public site yet.',
    icon: String(data.icon || '').trim() || '/favicon.svg',
    category: String(data.category || '').trim() || 'Games',
    version: String(data.version || '').trim() || '0',
    size: String(data.size || '').trim() || '0 MB',
    developer: String(data.developer || '').trim() || 'TBD',
    packageName: String(data.packageName || '').trim() || 'com.example.draft',
    reqAndroid: String(data.reqAndroid || '').trim() || '5.0+',
    totalDownloads: data.totalDownloads === '' || data.totalDownloads == null ? '0' : data.totalDownloads,
    ratingValue: Number(data.ratingValue) > 0 ? Number(data.ratingValue) : 4.5,
    ratingCount: Number(data.ratingCount) || 0,
    downloadUrl: String(data.downloadUrl || '').trim() || 'https://apkmoby.com/',
    publishDate: String(data.publishDate || '').trim() || today,
    updatedDate: String(data.updatedDate || '').trim() || today,
    featuredImage: String(data.featuredImage || '').trim() || String(data.icon || '').trim() || '/images/hero-mod-1280.webp',
    modFeatures: data.modFeatures || [],
    screenshots: data.screenshots || [],
    faqs: data.faqs || [],
    body: data.body || '',
  };
}

export async function deleteApp(env: GhEnv, slug: string, sha: string) {
  const res = await gh(env, `/contents/${apkPath(slug)}`, {
    method: 'DELETE',
    body: JSON.stringify({
      message: `cms: delete ${slug}`,
      sha,
      branch: env.GITHUB_BRANCH || 'main',
    }),
  });
  if (!res.ok) throw new Error(`GitHub delete failed (${res.status})`);
}

export async function uploadAsset(env: GhEnv, filename: string, bytes: ArrayBuffer, contentType: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `public/uploads/${Date.now()}-${safe}`;
  const binary = new Uint8Array(bytes);
  let binaryStr = '';
  for (const b of binary) binaryStr += String.fromCharCode(b);
  const res = await gh(env, `/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `cms: upload ${safe}`,
      content: btoa(binaryStr),
      branch: env.GITHUB_BRANCH || 'main',
    }),
  });
  if (!res.ok) throw new Error(`GitHub upload failed (${res.status})`);
  void contentType;
  return `/${path.replace(/^public\//, '')}`;
}
