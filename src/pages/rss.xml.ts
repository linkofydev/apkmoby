import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { SITE, absoluteUrl } from '../config';
import { getApks } from '../lib/apk';

export const GET: APIRoute = async (context) => {
  const apps = await getApks();
  return rss({
    title: `${SITE.name} APK Feed`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    trailingSlash: true,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
    customData: `<language>en</language><atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml" />`,
    items: apps.map((app) => ({
      title: app.data.metaTitle,
      description: app.data.metaDescription,
      pubDate: app.data.updatedDate,
      link: `/${app.data.slug}`,
      categories: [app.data.category, ...app.data.modFeatures],
    })),
  });
};
