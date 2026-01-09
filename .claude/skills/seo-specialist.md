# SEO Specialist Skill

---
## 🎯 CRITICAL: Read Project Context First
1. ✅ Read `.claude/PROJECT_CONTEXT.md`
2. ✅ Check `src/config/brand.ts` for URLs and branding
3. ✅ Use `brand.*` in meta tags

---

## Trigger
"Optimize SEO for [page]" or "Add meta tags to [page]"

## What This Does
Adds SEO optimization:
- Meta tags (title, description, OG)
- JSON-LD structured data
- Sitemap generation
- robots.txt

---

## Page Metadata Template

```typescript
import { Metadata } from 'next';
import { brand } from '@/config/brand';

export const metadata: Metadata = {
  title: `Page Title | ${brand.name}`,
  description: 'Page description optimized for search engines',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  openGraph: {
    title: `Page Title | ${brand.name}`,
    description: 'Description for social shares',
    url: `${brand.url}/page-path`,
    siteName: brand.name,
    images: [{
      url: `${brand.url}/og-image.jpg`,
      width: 1200,
      height: 630,
    }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Page Title | ${brand.name}`,
    description: 'Twitter description',
    images: [`${brand.url}/og-image.jpg`],
  },
};
```

---

## JSON-LD Structured Data

```tsx
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: brand.url,
    logo: `${brand.url}/logo.png`,
    sameAs: [
      brand.social.twitter,
      brand.social.github,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

## Usage Example

**User:** "Optimize homepage for SEO"

**Claude generates:** Metadata, OG tags, JSON-LD using `brand.*` config.
