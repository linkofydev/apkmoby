# dl.apkmoby.com — keep APK URLs out of Google

## 1) Deploy the download Worker

```bash
cd workers/dl-apkmoby
npx wrangler deploy
```

Then in Cloudflare Dashboard → Workers → `dl-apkmoby` → Triggers → Custom Domains:
add `dl.apkmoby.com` (DNS will create the hostname).

This Worker:
- Serves `/apk/<file>.apk` from R2
- Always sends `X-Robots-Tag: noindex, nofollow`
- Serves `/robots.txt` with `Disallow: /`

## 2) Cloudflare Transform Rules (extra belt-and-suspenders)

Zone: the zone that owns `dl.apkmoby.com` (usually `apkmoby.com`)

**Rules → Transform Rules → Modify Response Header → Create rule**

- Name: `dl-apk-noindex`
- When: Hostname equals `dl.apkmoby.com`
- Then: Set static `X-Robots-Tag` = `noindex, nofollow`

Optional second rule:
- When: Hostname equals `dl.apkmoby.com` AND URI Path ends with `.apk`
- Then: Set static `X-Robots-Tag` = `noindex, nofollow`

## 3) Do NOT add dl.apkmoby.com APK URLs to the site sitemap

`apkmoby.com` sitemap must only list HTML pages. Never list `https://dl.apkmoby.com/apk/...`.

## 4) Search Console

If `dl.apkmoby.com` is verified as a property, use Removals only if something was already indexed.
Prefer keeping the host undiscoverable via robots + X-Robots-Tag.
