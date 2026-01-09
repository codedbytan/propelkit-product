# 🎨 PropelKit UI Blocks Library

**21 production-ready, copy-paste components** for building SaaS landing pages and dashboards.

All components:
- ✅ Use dynamic brand configuration from `@/config/brand.ts`
- ✅ Built with shadcn/ui + Tailwind CSS
- ✅ Fully responsive (mobile-first)
- ✅ TypeScript with strict types
- ✅ Dark mode compatible
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Copy-paste ready

---

## 📦 Installation

1. **Copy the entire `/blocks` folder** to your `src/` directory:
   ```
   src/
   └── blocks/     ← Copy here
   ```

2. **Import and use** in your pages:
   ```tsx
   import { HeroGradient } from '@/blocks/hero';
   
   export default function HomePage() {
     return <HeroGradient />;
   }
   ```

---

## 🧩 Available Components

### **1. Hero Sections**
- `HeroGradient` - Gradient background with animated orbs, stats

**Usage:**
```tsx
import { HeroGradient } from '@/blocks/hero';

<HeroGradient
  title="Custom title"
  description="Custom description"
  primaryCTA="Get Started"
  onPrimaryClick={() => console.log('clicked')}
  showStats={true}
/>
```

---

### **2. Pricing**
- `PricingBasic` - 3-tier pricing with monthly/yearly toggle

**Usage:**
```tsx
import { PricingBasic } from '@/blocks/pricing';

<PricingBasic
  onSelectPlan={(tier, billing) => {
    console.log('Selected:', tier.name, billing);
  }}
/>
```

**Features:**
- Monthly/yearly billing toggle
- Popular badge on middle tier
- Customizable tiers
- Uses `brand.pricing` for currency

---

### **3. CTA Sections**
- `CTACentered` - Centered call-to-action section

**Usage:**
```tsx
import { CTACentered } from '@/blocks/cta';

<CTACentered
  title="Ready to start?"
  onPrimaryClick={() => router.push('/signup')}
/>
```

---

### **4. Navigation**
- `NavbarMinimal` - Clean, sticky navigation with mobile menu

**Usage:**
```tsx
import { NavbarMinimal } from '@/blocks/navbar';

<NavbarMinimal
  links={[
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ]}
  showAuth={true}
/>
```

---

### **5. Footer**
- `FooterMinimal` - Multi-column footer with links

**Usage:**
```tsx
import { FooterMinimal } from '@/blocks/footer';

<FooterMinimal />
```

**Auto-displays:**
- `brand.name`
- `brand.tagline`
- `brand.company`
- Current year

---

### **6. Forms**
- `FormContact` - Contact form with validation

**Usage:**
```tsx
import { FormContact } from '@/blocks/forms';

<FormContact />
```

**Features:**
- Form validation
- Loading states
- Success/error toasts
- Uses `brand.name` in messages

---

### **7. Testimonials**
- `TestimonialGrid` - Grid of customer testimonials

**Usage:**
```tsx
import { TestimonialGrid } from '@/blocks/testimonials';

<TestimonialGrid
  testimonials={[
    {
      name: 'John Doe',
      role: 'CEO',
      company: 'TechCorp',
      content: 'Great product!',
    },
  ]}
/>
```

---

### **8. Features**
- `FeaturesGrid` - Icon grid showcasing features

**Usage:**
```tsx
import { FeaturesGrid } from '@/blocks/features';
import { Zap, Shield } from 'lucide-react';

<FeaturesGrid
  features={[
    {
      icon: Zap,
      title: 'Fast',
      description: 'Lightning quick',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Bank-level security',
    },
  ]}
/>
```

---

### **9. Dashboard**
- `DashboardStatsCard` - Stat widget for dashboards

**Usage:**
```tsx
import { DashboardStatsCard } from '@/blocks/dashboard';
import { Users } from 'lucide-react';

<DashboardStatsCard
  title="Total Users"
  value="10,234"
  change={12.5}
  icon={Users}
  description="Active users"
/>
```

**Features:**
- Trend indicators (up/down)
- Optional icon
- Color-coded changes

---

### **10. Authentication**
- `AuthLoginSimple` - Clean login page

**Usage:**
```tsx
import { AuthLoginSimple } from '@/blocks/auth';

<AuthLoginSimple />
```

**Features:**
- Email/password fields
- Loading state
- Link to signup
- Uses `brand.name` in title

---

### **11. Blog**
- `BlogGrid` - Blog post grid with categories

**Usage:**
```tsx
import { BlogGrid } from '@/blocks/blog';

<BlogGrid
  posts={[
    {
      title: 'Post title',
      excerpt: 'Short description',
      category: 'Tutorial',
      date: '2024-01-15',
      readTime: '5 min read',
      slug: 'post-slug',
    },
  ]}
/>
```

---

### **12. Stats**
- `StatsRow` - Horizontal stats bar

**Usage:**
```tsx
import { StatsRow } from '@/blocks/stats';

<StatsRow
  stats={[
    { label: 'Users', value: '10k+' },
    { label: 'Countries', value: '50+' },
  ]}
/>
```

---

### **13. Team**
- `TeamGrid` - Team member profiles

**Usage:**
```tsx
import { TeamGrid } from '@/blocks/team';

<TeamGrid
  members={[
    {
      name: 'Jane Doe',
      role: 'CEO',
      bio: 'Building the future',
      avatar: '/avatars/jane.jpg',
    },
  ]}
/>
```

---

### **14. FAQ**
- `FAQAccordion` - Expandable FAQ section

**Usage:**
```tsx
import { FAQAccordion } from '@/blocks/faq';

<FAQAccordion
  items={[
    {
      question: 'What is this?',
      answer: 'This is a SaaS boilerplate...',
    },
  ]}
/>
```

---

### **15. Newsletter**
- `NewsletterCTA` - Email signup form

**Usage:**
```tsx
import { NewsletterCTA } from '@/blocks/newsletter';

<NewsletterCTA />
```

---

### **16. Modals**
- `Modal` - Reusable dialog component

**Usage:**
```tsx
import { Modal } from '@/blocks/modals';
import { Button } from '@/components/ui/button';

<Modal
  trigger={<Button>Open Modal</Button>}
  title="Modal Title"
  description="Description text"
>
  <p>Modal content here</p>
</Modal>
```

---

### **17. Loading**
- `LoadingSpinner` - Spinner component
- `LoadingPage` - Full page loader
- `LoadingCard` - Card with spinner

**Usage:**
```tsx
import { LoadingSpinner, LoadingPage } from '@/blocks/loading';

<LoadingSpinner size="lg" />
<LoadingPage />
```

---

### **18. Empty States**
- `EmptyState` - No data display
- `EmptyStateCard` - Card wrapper version

**Usage:**
```tsx
import { EmptyState } from '@/blocks/empty-states';
import { Inbox } from 'lucide-react';

<EmptyState
  icon={Inbox}
  title="No messages"
  description="You don't have any messages yet"
  action={{
    label: 'Send Message',
    onClick: () => console.log('clicked'),
  }}
/>
```

---

### **19. Error Pages**
- `Error404` - 404 page not found
- `Error500` - 500 server error

**Usage:**
```tsx
// In your app/not-found.tsx
import { Error404 } from '@/blocks/errors';

export default function NotFound() {
  return <Error404 />;
}

// In your app/error.tsx
import { Error500 } from '@/blocks/errors';

export default function Error() {
  return <Error500 />;
}
```

---

### **20. Notifications**
- `useNotification` - Toast notification hook
- `ToastExample` - Example component

**Usage:**
```tsx
import { useNotification } from '@/blocks/notifications';

function MyComponent() {
  const { showSuccess, showError } = useNotification();

  return (
    <button onClick={() => showSuccess('Saved!', 'Changes saved successfully.')}>
      Save
    </button>
  );
}
```

---

## 🎨 Customization

### **All components respect your brand config:**

```typescript
// src/config/brand.ts
export const brand = {
  name: "YourApp",          // Used in titles, messages
  tagline: "Your tagline",  // Used in hero, footer
  company: "YourCo Inc.",   // Used in footer, legal
  url: "https://yourapp.com",
  pricing: {
    currency: "INR",
    currencySymbol: "₹",
    // ...
  },
};
```

**When you change `brand.ts`, ALL components automatically update!**

---

## 🚀 Quick Start Example

**Create a landing page in 5 minutes:**

```tsx
// app/page.tsx
import { NavbarMinimal } from '@/blocks/navbar';
import { HeroGradient } from '@/blocks/hero';
import { FeaturesGrid } from '@/blocks/features';
import { PricingBasic } from '@/blocks/pricing';
import { TestimonialGrid } from '@/blocks/testimonials';
import { FAQAccordion } from '@/blocks/faq';
import { CTACentered } from '@/blocks/cta';
import { FooterMinimal } from '@/blocks/footer';

export default function LandingPage() {
  return (
    <>
      <NavbarMinimal />
      <HeroGradient />
      <FeaturesGrid />
      <PricingBasic onSelectPlan={(tier) => console.log(tier)} />
      <TestimonialGrid />
      <FAQAccordion />
      <CTACentered />
      <FooterMinimal />
    </>
  );
}
```

**Result:** Complete landing page with navigation, hero, features, pricing, testimonials, FAQ, CTA, and footer!

---

## 📚 Component Standards

Every component follows these rules:

1. **Dynamic Branding**: Uses `brand.*` from config
2. **TypeScript**: Strict types, no `any`
3. **Responsive**: Mobile-first design
4. **Dark Mode**: Works in light and dark themes
5. **Accessible**: WCAG 2.1 AA compliant
6. **Customizable**: Props for all important values
7. **Production-Ready**: Error handling, loading states

---

## 🎯 Best Practices

### **1. Always provide props for customization:**
```tsx
// ✅ Good
<HeroGradient 
  title="Custom title"
  description="Custom description"
/>

// ❌ Bad
<HeroGradient />  // Uses defaults
```

### **2. Handle events:**
```tsx
// ✅ Good
<PricingBasic 
  onSelectPlan={(tier, billing) => {
    // Handle plan selection
  }}
/>
```

### **3. Customize with your data:**
```tsx
// ✅ Good
<TestimonialGrid testimonials={yourTestimonials} />

// ❌ Bad
<TestimonialGrid />  // Uses default data
```

---

## 🛠️ Adding More Components

Want to add your own components?

1. **Create component file:**
   ```
   src/blocks/your-category/your-component.tsx
   ```

2. **Follow the pattern:**
   ```tsx
   'use client';
   
   import { brand } from '@/config/brand';
   
   interface YourComponentProps {
     // Props
   }
   
   export function YourComponent({ ...props }: YourComponentProps) {
     return (
       // JSX
     );
   }
   
   YourComponent.displayName = 'YourComponent';
   YourComponent.category = 'your-category';
   YourComponent.tags = ['tag1', 'tag2'];
   ```

3. **Export in index:**
   ```tsx
   // src/blocks/your-category/index.ts
   export { YourComponent } from './your-component';
   ```

---

## 📖 Component Categories

| Category | Count | Components |
|----------|-------|------------|
| Hero | 1 | HeroGradient |
| Pricing | 1 | PricingBasic |
| CTA | 1 | CTACentered |
| Navigation | 2 | NavbarMinimal, FooterMinimal |
| Forms | 1 | FormContact |
| Social Proof | 1 | TestimonialGrid |
| Features | 1 | FeaturesGrid |
| Dashboard | 1 | DashboardStatsCard |
| Auth | 1 | AuthLoginSimple |
| Content | 3 | BlogGrid, StatsRow, TeamGrid |
| Support | 2 | FAQAccordion, NewsletterCTA |
| Utilities | 6 | Modal, Loading, EmptyState, Errors, Notifications |

**Total: 21 components across 10 categories**

---

## 🎉 What's Next?

This is just the **"Greatest Hits"** starter pack. The full library will include 600+ components:

- 20 hero variations
- 15 pricing layouts
- 20 CTA sections
- 10 footer styles
- 20 form patterns
- And much more...

For now, these 21 components cover 90% of common use cases!

---

## 💡 Pro Tips

1. **Mix and match** - Combine components to create unique layouts
2. **Customize props** - Don't use defaults, make it yours
3. **Check brand.ts** - Update once, reflects everywhere
4. **Add your data** - Replace example content with real data
5. **Style with Tailwind** - Use `className` prop for tweaks

---

## 🐛 Troubleshooting

**Component not rendering?**
- Check if you imported correctly
- Verify shadcn/ui components are installed
- Make sure `brand.ts` exists

**TypeScript errors?**
- Update props to match interface
- Check required vs optional props

**Styling issues?**
- Verify Tailwind is configured
- Check dark mode is enabled
- Look for conflicting CSS

---

## 📞 Support

- **Documentation**: Check component README
- **Examples**: See usage examples above
- **Issues**: Each component is self-contained

---

**Built with ❤️ for PropelKit**

These components are designed to work seamlessly with PropelKit's infrastructure (Supabase, Razorpay, Inngest) while being flexible enough for any Next.js project.

**Start building your SaaS today! 🚀**
