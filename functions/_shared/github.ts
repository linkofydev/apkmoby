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
  downloadUrl: string;
  publishDate: string;
  updatedDate: string;
  featuredImage: string;
  screenshots: string[];
  body: string;
}

function yamlEscape(value: string): string {
  if (/[:#\n"'{}[\],&*?]|^\s|\s$/.test(value)) {
    return JSON.stringify(value);
  }
  return value;
}

export function toMarkdown(data: ApkPayload): string {
  const features = (data.modFeatures || []).filter(Boolean);
  const shots = (data.screenshots || []).filter(Boolean);
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
    `totalDownloads: ${data.totalDownloads}`,
    `ratingValue: ${data.ratingValue}`,
    `ratingCount: ${data.ratingCount}`,
    ...(features.length
      ? ['modFeatures:', ...features.map((f) => `  - ${yamlEscape(f)}`)]
      : ['modFeatures: []']),
    `downloadUrl: ${yamlEscape(data.downloadUrl)}`,
    `publishDate: ${data.publishDate}`,
    `updatedDate: ${data.updatedDate}`,
    `featuredImage: ${yamlEscape(data.featuredImage)}`,
    ...(shots.length
      ? ['screenshots:', ...shots.map((s) => `  - ${yamlEscape(s)}`)]
      : ['screenshots: []']),
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
      data[current] = value.slice(1, -1);
    } else if (/^\d+(\.\d+)?$/.test(value)) {
      data[current] = Number(value);
    } else {
      data[current] = value;
    }
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
    downloadUrl: String(data.downloadUrl || ''),
    publishDate: String(data.publishDate || ''),
    updatedDate: String(data.updatedDate || ''),
    featuredImage: String(data.featuredImage || ''),
    screenshots: lists.screenshots || [],
    body,
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
  const raw = atob(file.content.replace(/\n/g, ''));
  return { sha: file.sha, data: fromMarkdown(raw) };
}

export async function saveApp(env: GhEnv, data: ApkPayload, sha?: string) {
  const message = sha ? `cms: update ${data.slug}` : `cms: publish ${data.slug}`;
  const body = {
    message,
    content: utf8ToBase64(toMarkdown(data)),
    branch: env.GITHUB_BRANCH || 'main',
    ...(sha ? { sha } : {}),
  };
  const res = await gh(env, `/contents/${apkPath(data.slug)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub save failed (${res.status}): ${err}`);
  }
  return res.json();
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
