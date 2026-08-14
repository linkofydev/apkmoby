import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const apk = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/apk' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    appName: z.string(),
    slug: z.string(),
    icon: z.string(),
    category: z.string(),
    version: z.string(),
    size: z.string(),
    developer: z.string(),
    packageName: z.string(),
    reqAndroid: z.string(),
    totalDownloads: z.union([z.string(), z.number()]),
    ratingValue: z.number(),
    ratingCount: z.number(),
    modFeatures: z.array(z.string()),
    downloadUrl: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date(),
    featuredImage: z.string(),
    screenshots: z.array(z.string()),
  }),
});

export const collections = { apk };
