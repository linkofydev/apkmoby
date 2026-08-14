# Apk Moby

Live site: [https://apkmoby.com](https://apkmoby.com)

Android MOD APK listings built with Astro 7 + Tailwind CSS v4 for Cloudflare Pages.

## Local

```sh
npm install
cp .env.example .env
npm run dev
```

## Cloudflare Pages deploy

| Setting | Value |
| --- | --- |
| Framework | Astro |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | `22` |

Environment variables:

- `PUBLIC_SITE_URL` = `https://apkmoby.com`
- `INDEXNOW_KEY` = `7f3c9a1e8b4d2f6a0c5e9b1d3f7a2c4e`
- `INDEXNOW_ENABLED` = `true` after DNS is live

Custom domain: `apkmoby.com` (and `www.apkmoby.com` → apex).

CMS: update `repo` in `public/admin/config.yml` to your GitHub repo, then open `/admin/`.
