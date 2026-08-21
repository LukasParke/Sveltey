<div align="center">
<picture>
 <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/16b9c670-717f-4fec-9103-2eb6b75e79dc">
 <img alt="Sveltey SaaS Template logo" src="https://github.com/user-attachments/assets/e58daf0b-2067-4fd9-8c72-a752cc4fcef6">
</picture>
</div>

# 🚀 Sveltey - a SaaS Template built with SvelteKit

![Sveltey SaaS Template](https://github.com/user-attachments/assets/5dc91129-ebc7-4458-98b6-1862c6de4428)

A modern, production-ready SaaS template built with [SvelteKit 2](https://kit.svelte.dev/), [Svelte 5](https://svelte.dev/), [Supabase](https://supabase.com/), and [Skeleton UI](https://skeleton.dev/). Get your SaaS project up and running in hours, not months.

- [🚀 Sveltey - a SaaS Template built with SvelteKit](#-sveltey---a-saas-template-built-with-sveltekit)
  - [✨ Features](#-features)
    - [🔐 Authentication \& User Management](#-authentication--user-management)
    - [🎨 Modern UI/UX](#-modern-uiux)
    - [📝 Content Management](#-content-management)
    - [📊 Dashboard \& Analytics - Planned](#-dashboard--analytics---planned)
    - [💳 Payments \& Subscriptions](#-payments--subscriptions)
  - [🚀 Quick Start](#-quick-start)
  - [📦 Tech Stack](#-tech-stack)
  - [📁 Project Structure](#-project-structure)
  - [🔧 Configuration](#-configuration)
    - [Environment Variables](#environment-variables)
    - [Supabase Setup](#supabase-setup)
    - [Email Setup (Resend)](#email-setup-resend)
      - [Email Features](#email-features)
      - [Example Usage](#example-usage)
      - [Email Template example](#email-template-example)
    - [Stripe Setup](#stripe-setup)
    - [Analytics Setup (Plausible)](#analytics-setup-plausible)
      - [Current Configuration](#current-configuration)
      - [Customizing for Your Domain](#customizing-for-your-domain)
      - [Analytics Features](#analytics-features)
      - [Custom Events (Optional)](#custom-events-optional)
      - [Alternative Analytics](#alternative-analytics)
  - [🎯 Customization](#-customization)
    - [Branding](#branding)
    - [Components](#components)
  - [🔍 SEO \& Meta Tags](#-seo--meta-tags)
    - [Understanding the Meta Tag System](#understanding-the-meta-tag-system)
      - [Base Meta Tags Structure](#base-meta-tags-structure)
    - [Customizing Page Meta Tags](#customizing-page-meta-tags)
    - [Dynamic Meta Tags](#dynamic-meta-tags)
    - [Robot Control](#robot-control)
  - [🖼️ OpenGraph Images](#️-opengraph-images)
    - [Setting Up OpenGraph Images](#setting-up-opengraph-images)
      - [1. Default Site Image](#1-default-site-image)
      - [2. Page-Specific Images](#2-page-specific-images)
      - [3. Dynamic Images for Blog Posts](#3-dynamic-images-for-blog-posts)
    - [OpenGraph Image Best Practices](#opengraph-image-best-practices)
      - [Image Specifications](#image-specifications)
      - [Design Guidelines](#design-guidelines)
      - [Dynamic Image Generation](#dynamic-image-generation)
    - [Testing OpenGraph Images](#testing-opengraph-images)
    - [Common OpenGraph Properties](#common-opengraph-properties)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)
  - [🆘 Support](#-support)
  - [🙏 Acknowledgments](#-acknowledgments)

## ✨ Features

### 🔐 Authentication & User Management

- **Supabase Auth Integration**: Email/password sign-up (with email confirmation) and OAuth providers via PKCE
- **Protected Routes**: Server-side route protection and session management in `hooks.server.ts`
- **User Profiles**: Profile page with display-name editing
- **Password Reset**: Request-link flow with secure password update page

### 🎨 Modern UI/UX

- **Skeleton UI**: Beautiful, accessible components out of the box
- **Dark/Light Mode**: Built-in mode switching without flash-of-wrong-theme
- **Comprehensive Themes**: 22 beautiful handmade themes
- **Responsive Design**: Mobile-first, responsive layouts
- **Loading States**: Elegant loading indicators and transitions
- **Toast Notifications**: User-friendly feedback system

### 📝 Content Management

- **Blog System**: Built-in blog with markdown support
- **SEO Optimized**: Meta tags, Open Graph, and structured data
- **Contact Form**: Resend-powered contact form with validation, honeypot, and rate limiting

### 💳 Payments & Subscriptions

- **Native Stripe Integration**: Stripe Checkout subscriptions — no billing wrapper
- **Subscription Plans**: Configurable pricing tiers in `src/lib/config/plans.ts`
- **Billing Management**: Stripe Customer Portal for invoices, payment methods, and cancellation
- **Webhook Handling**: Signature-verified webhook mirroring subscription state into Postgres (RLS-safe)

### 📊 Dashboard & Analytics - Planned

- **Admin Dashboard**: Clean, intuitive admin interface
- **User Analytics**: Basic user metrics and insights
- **Real-time Updates**: Live data updates using Supabase real-time
- **Data Visualization**: Charts and graphs for key metrics
- **Privacy-First Analytics**: Built-in Plausible Analytics integration for GDPR-compliant tracking

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/sveltey.git
cd sveltey
# Install dependencies
npm install
# Edit .env with your Supabase, Resend and Stripe keys

# Start the development server
npm run dev
```

Visit `http://localhost:5173` and start building your SaaS!

## 📦 Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Skeleton UI
- **Styling**: Tailwind CSS
- **Analytics**: Plausible Analytics
- **Email**: Resend
- **Deployment**: Vercel/Netlify ready
- **Payments**: Stripe (native Checkout + Customer Portal + webhooks)

## 📁 Project Structure

```
src/
├── lib/
│   ├── auth/           # Auth helpers (error mapping, redirect guards)
│   ├── components/     # Reusable UI components (incl. auth/AuthForm)
│   ├── config/         # plans.ts — subscription plan definitions
│   ├── server/         # Server-only modules (stripe, supabase-admin)
│   ├── posts/          # Markdown blog posts
│   ├── blog.ts         # Blog loaders
│   └── supabase-client.ts # Browser Supabase client
├── routes/
│   ├── api/            # API endpoints (auth handled per-endpoint)
│   |   └── stripe/     # checkout, portal, webhook
│   ├── (app)/          # Authenticated shell
|   |   ├── app/        # Dashboard, profile, billing (guarded in hooks)
|   |   └── auth/       # login, register, reset, update-password, callback, logout
│   └── (marketing)/    # Public marketing pages
|       ├── blog        # Blog listing + [slug]
|       ├── contact     # Contact form (Resend)
|       ├── pricing     # Plans with Stripe Checkout buttons
|       ├── privacy     # Privacy policy page
|       └── terms       # Terms of service page
├── app.html            # App shell (theme bootstrap script)
├── app.css             # Global styles
└── hooks.server.ts     # Supabase session + route guards
supabase/
└── migrations/         # SQL migrations (subscriptions table + RLS)
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase service role (server-only; required for Stripe webhooks)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (contact form)
RESEND_API_KEY=your_resend_api_key
CONTACT_FROM_EMAIL="Sveltey Contact <onboarding@resend.dev>"
CONTACT_TO_EMAIL=where@to.deliver

# Stripe (see docs/PAYMENTS_SETUP.md)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
# Optional Stripe Price IDs (inline pricing used when unset)
STRIPE_PRICE_PRO=
STRIPE_PRICE_ENTERPRISE=
```

### Supabase Setup

1. Create a new Supabase project
2. Copy the project URL and anon key into `.env`
3. Run the included SQL migration: `supabase/migrations/0001_subscriptions.sql` (SQL editor or `supabase db push`)
4. Set up your authentication providers (see `docs/AUTHENTICATION_SETUP.md`)

### Email Setup (Resend)

Sveltey uses [Resend](https://resend.com/) for reliable email delivery with excellent developer experience.

1. **Create a Resend account** at [resend.com](https://resend.com/)
2. **Get your API key** from the Resend dashboard
3. **Add to environment variables**:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```
4. **Verify your domain** (optional but recommended for production):
   - Add your domain in the Resend dashboard
   - Configure DNS records as instructed

#### Email Features

- **Contact Form Delivery**: The `/contact` form sends through a server action with validation, a honeypot field, and per-IP rate limiting
- **Graceful Dev Mode**: Without `RESEND_API_KEY`, submissions are logged to the server console and the UI says so — never a fake success
- **Simple API**: Resend is imported statically in `src/routes/(marketing)/contact/+page.server.ts`

#### Example: the built-in contact action

See `src/routes/(marketing)/contact/+page.server.ts` for the full implementation
(validation, honeypot, rate limit, HTML escaping). The send call itself:

```typescript
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);
await resend.emails.send({
	from: env.CONTACT_FROM_EMAIL ?? 'Sveltey Contact <onboarding@resend.dev>',
	to: env.CONTACT_TO_EMAIL,
	replyTo: submissionEmail,
	subject: `Contact form: ${subject}`,
	text,
	html
});
```

#### Email Template example

Create reusable email templates in `src/lib/emails/`:

```typescript
// src/lib/emails/welcome.ts
export const welcomeEmail = (userName: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Welcome to Sveltey, ${userName}!</h1>
    <p>Thank you for joining our platform. We're excited to have you on board.</p>
    <a href="https://yourdomain.com/dashboard" 
       style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
      Get Started
    </a>
  </div>
`;
```

### Stripe Setup

Full walkthrough in **[docs/PAYMENTS_SETUP.md](docs/PAYMENTS_SETUP.md)**:

1. Create a Stripe account and set `STRIPE_SECRET_KEY` (+ `SUPABASE_SERVICE_ROLE_KEY` for webhooks)
2. Apply `supabase/migrations/0001_subscriptions.sql`
3. Optionally create Products/Prices and set `STRIPE_PRICE_PRO` / `STRIPE_PRICE_ENTERPRISE`
4. Forward webhooks (`checkout.session.completed`, `customer.subscription.*`) and set `STRIPE_WEBHOOK_SECRET`
5. Activate the Customer Portal link in the Stripe dashboard

### Analytics Setup (Plausible)

Sveltey comes pre-configured with [Plausible Analytics](https://plausible.io/) - a lightweight, privacy-focused analytics solution that's GDPR compliant by default.

#### Current Configuration

The analytics script is already integrated in `src/app.html`:

```html
<script defer data-domain="sveltey.dev" src="https://events.plygrnd.org/js/script.js"></script>
```

#### Customizing for Your Domain

1. **Self-hosted Plausible**: If using your own Plausible instance, update the script source
2. **Plausible Cloud**: Change to the official Plausible script:
   ```html
   <script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
   ```
3. **Update Domain**: Replace `data-domain="sveltey.dev"` with your actual domain

#### Analytics Features

- **Privacy-First**: No cookies, no personal data collection
- **GDPR Compliant**: No consent banners required
- **Lightweight**: Less than 1KB script size
- **Real-time**: Live visitor tracking
- **Goal Tracking**: Custom event tracking available

#### Custom Events (Optional)

Add custom event tracking for user actions:

```javascript
// Track custom events
plausible('signup', { props: { plan: 'premium' } });
plausible('purchase', { props: { amount: 99 } });
```

#### Alternative Analytics

To use a different analytics provider:

1. Remove the Plausible script from `src/app.html`
2. Add your preferred analytics script (Google Analytics, Fathom, etc.)
3. Update the privacy policy accordingly

## 🎯 Customization

### Branding

- Update `app.html` for favicon and meta tags
- Modify `src/lib/config.ts` for app configuration
- Customize colors in with a [custom Skeleton UI theme](https://www.skeleton.dev/docs/design/themes#custom-themes)
- Replace logo

### Components

- All components are in `src/lib/components/`
- Skeleton UI provides the base component library
- Easy to theme and customize with CSS variables

## 🔍 SEO \& Meta Tags

Sveltey comes with a comprehensive SEO system built on top of `svelte-meta-tags` that provides automatic meta tag management, OpenGraph support, and Twitter Card integration.

### Understanding the Meta Tag System

The meta tag system in Sveltey uses a two-level approach:

1. **Base Meta Tags** (`src/routes/+layout.ts`) - Global defaults for your entire site
2. **Page Meta Tags** (`src/routes/*/+page.ts`) - Page-specific overrides and additions

#### Base Meta Tags Structure

The base meta tags are defined in `src/routes/+layout.ts` and include:

```typescript
const baseMetaTags = Object.freeze({
	title: 'Sveltey - SvelteKit SaaS Template',
	titleTemplate: '%s | Sveltey',
	description: 'Your default site description...',
	canonical: new URL(url.pathname, url.origin).href,
	robots: 'index,follow',
	keywords: ['SvelteKit', 'SaaS', 'template'],

	openGraph: {
		type: 'website',
		url: new URL(url.pathname, url.origin).href,
		title: 'Sveltey - SvelteKit SaaS Template',
		description: 'Your OpenGraph description...',
		siteName: 'Sveltey',
		locale: 'en_US',
		images: [
			{
				url: `${url.origin}/og-image.jpg`,
				width: 1200,
				height: 630,
				alt: 'Sveltey - SvelteKit SaaS Template',
				type: 'image/jpeg'
			}
		]
	},

	twitter: {
		cardType: 'summary_large_image',
		site: '@sveltey_dev',
		creator: '@sveltey_dev',
		title: 'Sveltey - SvelteKit SaaS Template',
		description: 'Your Twitter description...',
		image: `${url.origin}/og-image.jpg`,
		imageAlt: 'Sveltey - SvelteKit SaaS Template'
	}
}) satisfies MetaTagsProps;
```

### Customizing Page Meta Tags

Each page can override and extend the base meta tags by exporting a `load` function in its `+page.ts` file:

```typescript
// src/routes/your-page/+page.ts
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = () => {
	const pageMetaTags = Object.freeze({
		title: 'Your Page Title',
		description: 'Specific description for this page',
		keywords: ['additional', 'keywords', 'for', 'this', 'page'],

		openGraph: {
			title: 'Your Page Title - Brand Name',
			description: 'OpenGraph description for social sharing',
			type: 'article', // or 'website', 'product', etc.
			images: [
				{
					url: 'https://your-domain.com/specific-og-image.jpg',
					width: 1200,
					height: 630,
					alt: 'Description of your image'
				}
			]
		},

		twitter: {
			title: 'Twitter-specific title',
			description: 'Twitter-specific description'
		},

		// Additional meta tags
		additionalMetaTags: [
			{
				name: 'author',
				content: 'Your Name'
			},
			{
				property: 'article:published_time',
				content: '2024-01-01T00:00:00Z'
			}
		]
	}) satisfies MetaTagsProps;

	return {
		pageMetaTags
	};
};
```

### Dynamic Meta Tags

For dynamic pages (like blog posts), you can generate meta tags based on content:

```typescript
// src/routes/blog/[slug]/+page.server.ts
export const load = async ({ params, url }) => {
	const post = await getPostBySlug(params.slug);

	const pageMetaTags = Object.freeze({
		title: post.title,
		description: post.excerpt,
		canonical: new URL(`/blog/${params.slug}`, url.origin).href,

		openGraph: {
			type: 'article',
			title: post.title,
			description: post.excerpt,
			url: new URL(`/blog/${params.slug}`, url.origin).href,
			images: post.featuredImage
				? [
						{
							url: post.featuredImage,
							width: 1200,
							height: 630,
							alt: post.title
						}
					]
				: undefined,
			article: {
				publishedTime: post.publishedAt,
				authors: [post.author],
				section: 'Technology',
				tags: post.tags
			}
		}
	}) satisfies MetaTagsProps;

	return { post, pageMetaTags };
};
```

### Robot Control

Control search engine indexing per page:

```typescript
const pageMetaTags = {
	robots: 'noindex,nofollow', // Don't index this page
	// or
	robots: 'index,follow', // Index this page (default)
	// or
	robots: 'index,nofollow' // Index but don't follow links
};
```

## 🖼️ OpenGraph Images

OpenGraph images are crucial for social media sharing and SEO. Sveltey provides a flexible system for managing these images.

### Setting Up OpenGraph Images

#### 1. Default Site Image

Place your default OpenGraph image in the `static` folder:

```
static/
├── og-image.jpg        # Default 1200x630 image
├── og-image-square.jpg # Optional square variant
└── favicon.png
```

The default image is automatically referenced in your base meta tags:

```typescript
// src/routes/+layout.ts
openGraph: {
	images: [
		{
			url: `${url.origin}/og-image.jpg`,
			width: 1200,
			height: 630,
			alt: 'Sveltey - SvelteKit SaaS Template',
			type: 'image/jpeg'
		}
	];
}
```

#### 2. Page-Specific Images

Override the default image for specific pages:

```typescript
// src/routes/pricing/+page.ts
const pageMetaTags = {
	openGraph: {
		images: [
			{
				url: `${url.origin}/og-pricing.jpg`,
				width: 1200,
				height: 630,
				alt: 'Sveltey Pricing Plans',
				type: 'image/jpeg'
			}
		]
	}
};
```

#### 3. Dynamic Images for Blog Posts

For blog posts or dynamic content, you can generate or specify images dynamically:

```typescript
// src/routes/blog/[slug]/+page.server.ts
const pageMetaTags = {
	openGraph: {
		images: post.featuredImage
			? [
					{
						url: post.featuredImage,
						width: 1200,
						height: 630,
						alt: post.title,
						type: 'image/jpeg'
					}
				]
			: [
					{
						url: `${url.origin}/og-blog-default.jpg`,
						width: 1200,
						height: 630,
						alt: 'Sveltey Blog',
						type: 'image/jpeg'
					}
				]
	}
};
```

### OpenGraph Image Best Practices

#### Image Specifications

- **Recommended Size**: 1200x630 pixels (1.91:1 aspect ratio)
- **Minimum Size**: 600x315 pixels
- **Maximum Size**: 8MB
- **Format**: JPG or PNG (JPG preferred for smaller file size)

#### Design Guidelines

```typescript
// Example with multiple image variants
openGraph: {
	images: [
		{
			url: `${url.origin}/og-image-large.jpg`,
			width: 1200,
			height: 630,
			alt: 'Large image for Facebook, LinkedIn',
			type: 'image/jpeg'
		},
		{
			url: `${url.origin}/og-image-square.jpg`,
			width: 1080,
			height: 1080,
			alt: 'Square image for Instagram, Twitter',
			type: 'image/jpeg'
		}
	];
}
```

#### Dynamic Image Generation

For advanced use cases, you can generate images dynamically:

```typescript
// src/routes/api/og/[slug]/+server.ts
export async function GET({ params, url }) {
	const post = await getPostBySlug(params.slug);

	// Generate image using libraries like @vercel/og or canvas
	const image = await generateOGImage({
		title: post.title,
		author: post.author,
		template: 'blog-post'
	});

	return new Response(image, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
}
```

Then reference it in your meta tags:

```typescript
openGraph: {
	images: [
		{
			url: `${url.origin}/api/og/${params.slug}`,
			width: 1200,
			height: 630,
			alt: post.title,
			type: 'image/png'
		}
	];
}
```

### Testing OpenGraph Images

Use these tools to test your OpenGraph implementation:

- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### Common OpenGraph Properties

```typescript
openGraph: {
  type: 'website',           // website, article, product, etc.
  title: 'Page Title',       // Specific title for social sharing
  description: 'Description', // Social media description
  url: 'https://example.com', // Canonical URL
  siteName: 'Site Name',     // Your site/brand name
  locale: 'en_US',           // Language and region

  // For articles
  article: {
    publishedTime: '2024-01-01T00:00:00Z',
    modifiedTime: '2024-01-02T00:00:00Z',
    authors: ['Author Name'],
    section: 'Technology',
    tags: ['svelte', 'sveltekit']
  },

  // For products
  product: {
    price: {
      amount: '29.99',
      currency: 'USD'
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs or request features via [GitHub Issues](../../issues)

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - The amazing web framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Skeleton UI](https://skeleton.dev/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Stripe](https://stripe.com/) - Payment processing

---

_Ready to launch your SaaS? Get started with Sveltey today!_
