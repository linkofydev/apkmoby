export const SITE = {
  name: 'Apk Moby',
  tagline: 'Download Android MOD APKs Fast & Free',
  description:
    'Download the latest Android MOD APKs on Apk Moby. Get verified games, tools, and apps with version info, screenshots, ratings, and a fast two-step download.',
  url: (import.meta.env.PUBLIC_SITE_URL as string | undefined) || 'https://apkmoby.com',
  locale: 'en_US',
  lang: 'en',
  twitter: '@apkmoby',
  defaultOgImage: '/og-default.svg',
  author: 'Apk Moby',
  email: 'dmca@apkmoby.com',
  indexNowKey:
    (import.meta.env.INDEXNOW_KEY as string | undefined) ||
    '7f3c9a1e8b4d2f6a0c5e9b1d3f7a2c4e',
  downloadTimerSeconds: 5,
} as const;

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/category/games', label: 'Games' },
  { href: '/category/tools', label: 'Tools' },
  { href: '/category/lifestyle', label: 'Lifestyle' },
] as const;

export const CATEGORY_SCHEMA: Record<string, string> = {
  games: 'GameApplication',
  tools: 'UtilitiesApplication',
  social: 'SocialNetworkingApplication',
  photography: 'MultimediaApplication',
  productivity: 'BusinessApplication',
  lifestyle: 'LifestyleApplication',
  music: 'MultimediaApplication',
  health: 'HealthApplication',
};

export function absoluteUrl(path = '/'): string {
  const base = SITE.url.replace(/\/$/, '');
  if (!path || path === '/') return `${base}/`;
  if (/^https?:\/\//.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function categorySlug(category: string): string {
  return category.trim().toLowerCase().replace(/\s+/g, '-');
}

export function applicationCategory(category: string): string {
  return CATEGORY_SCHEMA[categorySlug(category)] ?? 'SoftwareApplication';
}
