/** Shared social platforms for admin Social Settings + article Share modal. */

export type ShareContext = {
  title: string;
  url: string;
  image?: string;
};

export type SocialPlatform = {
  id: string;
  label: string;
  home: string;
  /**
   * Share URL template. Placeholders: {{url}} {{title}} {{image}} {{text}}
   * Empty string = no web composer (open home + copy link to paste).
   */
  shareTemplate: string;
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    home: 'https://www.facebook.com/',
    shareTemplate: 'https://www.facebook.com/sharer/sharer.php?u={{url}}',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    home: 'https://www.instagram.com/',
    shareTemplate: '',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    home: 'https://web.whatsapp.com/',
    shareTemplate: 'https://api.whatsapp.com/send?text={{text}}',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    home: 'https://studio.youtube.com/',
    shareTemplate: '',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    home: 'https://www.tiktok.com/upload',
    shareTemplate: '',
  },
  {
    id: 'wechat',
    label: 'WeChat',
    home: 'https://www.wechat.com/',
    shareTemplate: '',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    home: 'https://web.telegram.org/',
    shareTemplate: 'https://t.me/share/url?url={{url}}&text={{title}}',
  },
  {
    id: 'snapchat',
    label: 'Snapchat',
    home: 'https://www.snapchat.com/',
    shareTemplate: '',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    home: 'https://www.reddit.com/',
    shareTemplate: 'https://www.reddit.com/submit?url={{url}}&title={{title}}',
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    home: 'https://twitter.com/',
    shareTemplate: 'https://twitter.com/intent/tweet?url={{url}}&text={{title}}',
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    home: 'https://www.pinterest.com/',
    shareTemplate:
      'https://pinterest.com/pin/create/button/?url={{url}}&media={{image}}&description={{title}}',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    home: 'https://www.linkedin.com/',
    shareTemplate: 'https://www.linkedin.com/sharing/share-offsite/?url={{url}}',
  },
  {
    id: 'discord',
    label: 'Discord',
    home: 'https://discord.com/channels/@me',
    shareTemplate: '',
  },
  {
    id: 'quora',
    label: 'Quora',
    home: 'https://www.quora.com/',
    shareTemplate: 'https://www.quora.com/share?url={{url}}&title={{title}}',
  },
  {
    id: 'twitch',
    label: 'Twitch',
    home: 'https://www.twitch.tv/',
    shareTemplate: '',
  },
  {
    id: 'threads',
    label: 'Threads',
    home: 'https://www.threads.net/',
    shareTemplate: 'https://www.threads.net/intent/post?text={{text}}',
  },
  {
    id: 'medium',
    label: 'Medium',
    home: 'https://medium.com/new-story',
    shareTemplate: '',
  },
  {
    id: 'tumblr',
    label: 'Tumblr',
    home: 'https://www.tumblr.com/',
    shareTemplate:
      'https://www.tumblr.com/widgets/share/tool?canonicalUrl={{url}}&title={{title}}&caption={{title}}',
  },
  {
    id: 'douyin',
    label: 'Douyin',
    home: 'https://www.douyin.com/',
    shareTemplate: '',
  },
  {
    id: 'kuaishou',
    label: 'Kuaishou',
    home: 'https://www.kuaishou.com/',
    shareTemplate: '',
  },
  {
    id: 'weibo',
    label: 'Sina Weibo',
    home: 'https://weibo.com/',
    shareTemplate:
      'https://service.weibo.com/share/share.php?url={{url}}&title={{title}}&pic={{image}}',
  },
  {
    id: 'xiaohongshu',
    label: 'Xiaohongshu (RedNote)',
    home: 'https://www.xiaohongshu.com/',
    shareTemplate: '',
  },
  {
    id: 'qq',
    label: 'QQ',
    home: 'https://im.qq.com/',
    shareTemplate:
      'https://connect.qq.com/widget/shareqq/index.html?url={{url}}&title={{title}}&pics={{image}}',
  },
  {
    id: 'vk',
    label: 'VKontakte (VK)',
    home: 'https://vk.com/',
    shareTemplate: 'https://vk.com/share.php?url={{url}}&title={{title}}',
  },
  {
    id: 'line',
    label: 'Line',
    home: 'https://line.me/',
    shareTemplate: 'https://social-plugins.line.me/lineit/share?url={{url}}',
  },
  {
    id: 'viber',
    label: 'Viber',
    home: 'https://www.viber.com/',
    shareTemplate: 'viber://forward?text={{text}}',
  },
  {
    id: 'signal',
    label: 'Signal',
    home: 'https://signal.org/',
    shareTemplate: '',
  },
  {
    id: 'wecom',
    label: 'WeChat Work',
    home: 'https://work.weixin.qq.com/',
    shareTemplate: '',
  },
  {
    id: 'teams',
    label: 'Microsoft Teams',
    home: 'https://teams.microsoft.com/',
    shareTemplate: 'https://teams.microsoft.com/share?href={{url}}&msgText={{title}}',
  },
  {
    id: 'skype',
    label: 'Skype',
    home: 'https://web.skype.com/',
    shareTemplate: 'https://web.skype.com/share?url={{url}}&text={{title}}',
  },
  {
    id: 'zoom',
    label: 'Zoom',
    home: 'https://zoom.us/',
    shareTemplate: '',
  },
  {
    id: 'clubhouse',
    label: 'Clubhouse',
    home: 'https://www.clubhouse.com/',
    shareTemplate: '',
  },
  {
    id: 'mastodon',
    label: 'Mastodon',
    home: 'https://mastodon.social/',
    shareTemplate: 'https://mastodonshare.com/?text={{title}}&url={{url}}',
  },
  {
    id: 'bluesky',
    label: 'Bluesky',
    home: 'https://bsky.app/',
    shareTemplate: 'https://bsky.app/intent/compose?text={{text}}',
  },
  {
    id: 'substack',
    label: 'Substack',
    home: 'https://substack.com/',
    shareTemplate: '',
  },
  {
    id: 'patreon',
    label: 'Patreon',
    home: 'https://www.patreon.com/',
    shareTemplate: '',
  },
  {
    id: 'flickr',
    label: 'Flickr',
    home: 'https://www.flickr.com/',
    shareTemplate: '',
  },
  {
    id: 'behance',
    label: 'Behance',
    home: 'https://www.behance.net/',
    shareTemplate: '',
  },
  {
    id: 'dribbble',
    label: 'Dribbble',
    home: 'https://dribbble.com/',
    shareTemplate: '',
  },
  {
    id: 'deviantart',
    label: 'DeviantArt',
    home: 'https://www.deviantart.com/',
    shareTemplate: '',
  },
  {
    id: 'soundcloud',
    label: 'SoundCloud',
    home: 'https://soundcloud.com/',
    shareTemplate: '',
  },
  {
    id: 'mixcloud',
    label: 'Mixcloud',
    home: 'https://www.mixcloud.com/',
    shareTemplate: '',
  },
  {
    id: 'lastfm',
    label: 'Last.fm',
    home: 'https://www.last.fm/',
    shareTemplate: '',
  },
  {
    id: 'xing',
    label: 'Xing',
    home: 'https://www.xing.com/',
    shareTemplate: 'https://www.xing.com/spi/shares/new?url={{url}}',
  },
  {
    id: 'bizsugar',
    label: 'BizSugar',
    home: 'https://www.bizsugar.com/',
    shareTemplate: '',
  },
  {
    id: 'steemit',
    label: 'Steemit',
    home: 'https://steemit.com/',
    shareTemplate: '',
  },
  {
    id: 'meetup',
    label: 'Meetup',
    home: 'https://www.meetup.com/',
    shareTemplate: '',
  },
  {
    id: 'nextdoor',
    label: 'Nextdoor',
    home: 'https://nextdoor.com/',
    shareTemplate: 'https://nextdoor.com/sharekit/?body={{text}}&url={{url}}',
  },
  {
    id: 'rumble',
    label: 'Rumble',
    home: 'https://rumble.com/',
    shareTemplate: '',
  },
  {
    id: 'email',
    label: 'Email',
    home: 'mailto:',
    shareTemplate: 'mailto:?subject={{title}}&body={{text}}',
  },
  {
    id: 'sms',
    label: 'SMS',
    home: 'sms:',
    shareTemplate: 'sms:?&body={{text}}',
  },
  {
    id: 'other',
    label: 'Other',
    home: '',
    shareTemplate: '',
  },
];

export const SOCIAL_PLATFORM_LABELS = SOCIAL_PLATFORMS.map((p) => p.label);

export function fillShareTemplate(
  template: string,
  ctx: ShareContext,
): string {
  const title = encodeURIComponent(ctx.title || '');
  const url = encodeURIComponent(ctx.url || '');
  const image = encodeURIComponent(ctx.image || '');
  const text = encodeURIComponent(`${ctx.title || ''} ${ctx.url || ''}`.trim());
  return template
    .replaceAll('{{title}}', title)
    .replaceAll('{{url}}', url)
    .replaceAll('{{image}}', image)
    .replaceAll('{{text}}', text);
}

/** Client-safe platform list for inline admin scripts. */
export function socialPlatformsForClient() {
  return SOCIAL_PLATFORMS.map((p) => ({
    id: p.id,
    label: p.label,
    home: p.home,
    shareTemplate: p.shareTemplate,
  }));
}
