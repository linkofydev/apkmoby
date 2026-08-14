import { getCollection, type CollectionEntry } from 'astro:content';
import { isGameCategory } from '../config';

export type ApkEntry = CollectionEntry<'apk'>;

export async function getApks(): Promise<ApkEntry[]> {
  try {
    const apps = await getCollection('apk');
    return apps.sort(
      (a, b) => b.data.updatedDate.valueOf() - a.data.updatedDate.valueOf(),
    );
  } catch {
    return [];
  }
}

export async function getApkBySlug(slug: string): Promise<ApkEntry | undefined> {
  const apps = await getApks();
  return apps.find((app) => app.data.slug === slug || app.id === slug);
}

export function relatedApps(apps: ApkEntry[], current: ApkEntry, limit = 6): ApkEntry[] {
  const same = apps.filter(
    (app) =>
      app.data.slug !== current.data.slug &&
      app.data.category.toLowerCase() === current.data.category.toLowerCase(),
  );
  if (same.length >= limit) return same.slice(0, limit);
  const rest = apps.filter(
    (app) =>
      app.data.slug !== current.data.slug &&
      !same.some((s) => s.data.slug === app.data.slug),
  );
  return [...same, ...rest].slice(0, limit);
}

export function formatDownloads(value: string | number): string {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  }
  return value;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function uniqueCategories(apps: ApkEntry[]): string[] {
  return [...new Set(apps.map((app) => app.data.category))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function appsByCategory(apps: ApkEntry[]): { category: string; apps: ApkEntry[] }[] {
  const map = new Map<string, ApkEntry[]>();
  for (const app of apps) {
    const list = map.get(app.data.category) ?? [];
    list.push(app);
    map.set(app.data.category, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([category, grouped]) => ({ category, apps: grouped }));
}

export function splitGamesAndApps(apps: ApkEntry[]): { games: ApkEntry[]; appsOnly: ApkEntry[] } {
  const games: ApkEntry[] = [];
  const appsOnly: ApkEntry[] = [];
  for (const app of apps) {
    if (isGameCategory(app.data.category)) games.push(app);
    else appsOnly.push(app);
  }
  return { games, appsOnly };
}

export function defaultFaqs(app: ApkEntry) {
  return [
    {
      q: `Is ${app.data.appName} safe to install?`,
      a: `Listings on this template include version, package name (${app.data.packageName}), and file size (${app.data.size}) so you can verify the APK before installing. Only install files from sources you trust.`,
    },
    {
      q: `What Android version does ${app.data.appName} need?`,
      a: `${app.data.appName} requires Android ${app.data.reqAndroid}.`,
    },
    {
      q: `What is included in this ${app.data.appName} MOD?`,
      a: app.data.modFeatures.length
        ? `This build highlights: ${app.data.modFeatures.join(', ')}.`
        : `This listing is a standard APK package without extra MOD flags.`,
    },
    {
      q: `How do I install the ${app.data.appName} APK?`,
      a: `Open the download page, wait for the timer, download the APK, then enable Install unknown apps for your browser and tap the file to install.`,
    },
  ];
}
