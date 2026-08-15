import type { CmsEnv } from '../../_shared/auth';
import { json, requireAdmin } from '../../_shared/auth';
import { getApp, listApps } from '../../_shared/github';

export const onRequestGet: PagesFunction<CmsEnv> = async ({ request, env }) => {
  const auth = await requireAdmin(env, request);
  if (auth instanceof Response) return auth;
  try {
    const files = await listApps(env);
    const apps = [];
    for (const file of files) {
      const slug = file.name.replace(/\.md$/, '');
      const entry = await getApp(env, slug);
      if (entry) {
        apps.push({
          slug: entry.data.slug || slug,
          sha: entry.sha,
          appName: entry.data.appName,
          title: entry.data.title || entry.data.metaTitle || entry.data.appName,
          category: entry.data.category,
          version: entry.data.version,
          updatedDate: entry.data.updatedDate,
          icon: entry.data.icon,
          featuredImage: entry.data.featuredImage || entry.data.icon,
        });
      }
    }
    apps.sort((a, b) => String(b.updatedDate).localeCompare(String(a.updatedDate)));
    return json({ apps });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'List failed' }, { status: 500 });
  }
};
