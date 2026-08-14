import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const stringList = z.preprocess((value) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map((item) => String(item ?? '').trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}, z.array(z.string()));

const apk = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/apk' }),
  schema: z.object({
    title: z.coerce.string(),
    metaTitle: z.coerce.string(),
    metaDescription: z.coerce.string(),
    appName: z.coerce.string(),
    slug: z.coerce.string(),
    icon: z.coerce.string(),
    category: z.coerce.string(),
    // CMS YAML may emit bare numbers (version: 1, reqAndroid: 4.0) — coerce to string.
    version: z.coerce.string(),
    size: z.coerce.string(),
    developer: z.coerce.string(),
    packageName: z.coerce.string(),
    reqAndroid: z.coerce.string(),
    totalDownloads: z.union([z.string(), z.number()]),
    ratingValue: z.coerce.number(),
    ratingCount: z.coerce.number(),
    modFeatures: stringList,
    modHtml: z.string().optional(),
    downloadUrl: z.coerce.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date(),
    featuredImage: z.coerce.string(),
    screenshots: stringList,
  }),
});

export const collections = { apk };
