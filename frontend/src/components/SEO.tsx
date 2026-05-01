
import { appName } from '@/constants';
import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

const SEO = ({
  title,
  description,
  keywords = '',
  canonicalUrl = ''
}: SEOProps) => {
  useEffect(() => {
    const formattedTitle = `${title} | ${appName}`;
    const upsertMeta = (selector: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      if (!el) {
        el = document.createElement(attrs.rel ? 'link' : 'meta');
        Object.entries(attrs).forEach(([key, value]) => el!.setAttribute(key, value));
        document.head.appendChild(el);
      } else {
        Object.entries(attrs).forEach(([key, value]) => el!.setAttribute(key, value));
      }
    };

    document.title = formattedTitle;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: formattedTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: formattedTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });

    if (keywords) upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords });
    if (canonicalUrl) upsertMeta('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });
  }, [canonicalUrl, description, keywords, title]);

  return null;
};

export default SEO;
