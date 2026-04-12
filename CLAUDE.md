# IvyPi Marketing Site

Static marketing site for IvyPi college consulting. Hosted on Cloudflare Pages at ivypi.org.

## Structure
- 10 pages: index, college-consulting, college-application, high-school-application, seminars, about-us, blog, privacy-policy, terms-of-service, 404
- 4 locales: English (default), Spanish, Korean, Simplified Chinese
- Shared components: `components/header.html`, `components/footer.html`, `components/contact.html`

## File Structure
```
├── index.html                          # Homepage
├── college-consulting/index.html       # College Consulting
├── college-application/index.html      # College Application
├── high-school-application/index.html  # High School Application
├── seminars/index.html                 # Seminars
├── about-us/index.html                 # About Us
├── blog/index.html                     # Blog
├── privacy-policy/index.html           # Privacy Policy (English only)
├── terms-of-service/index.html         # Terms of Service (English only)
├── 404.html                            # Custom 404 (English only)
├── components/
│   ├── header.html                     # Site header + mobile menu
│   ├── footer.html                     # Footer + language selector + back-to-top + cookie consent banner
│   └── contact.html                    # Contact form (Web3Forms)
├── assets/
│   ├── css/main.css                    # Tailwind source
│   ├── css/tailwind.css                # Compiled Tailwind output
│   ├── js/main.js                      # All site JS (~380 lines)
│   └── images/                         # All images (WebP + legacy JPEG/PNG)
├── locales/                            # i18n YAML files (en, es, ko, zh-CN)
├── scripts/
│   ├── build-html.js                   # Generates localized HTML into dist/
│   └── validate-i18n.js                # Validates translation completeness
├── dist/                               # Build output (deployed to Cloudflare)
├── _headers                            # Cloudflare Pages security + caching headers
├── _redirects                          # Cloudflare redirects (if present)
├── sitemap.xml                         # XML sitemap
├── robots.txt                          # Robots crawl rules
├── tailwind.config.js                  # Tailwind configuration
└── package.json                        # npm scripts and dependencies
```

## Tech Stack
- Tailwind CSS v4.2 (source: `assets/css/main.css` → compiled: `assets/css/tailwind.css`)
- Vanilla JS (`assets/js/main.js`, ~380 lines, no frameworks)
- Google Fonts: Jost (300/400/600), Poppins (400/500/600), DM Serif Display
- No bundler — pure static HTML/CSS/JS

## Build & Dev
```bash
npm run build       # Full build: Tailwind CSS + localized HTML into dist/
npm run build:css   # Compile Tailwind only (minified)
npm run build:html  # Generate localized HTML only
npm run dev         # Build + serve from dist/
npm run watch:css   # Auto-recompile CSS on changes
```
- **Important:** Always serve from `dist/`, not project root — source HTML has `{{t.*}}` locale tokens
- After changing HTML or locale YAML, re-run `npm run build:html`

## i18n System
- YAML translation files in `locales/` (en.yml is source of truth)
- `{{t.scope.key}}` tokens in HTML, replaced by `scripts/build-html.js`
- `{{lang_href_en}}`, `{{lang_href_es}}`, etc. for language picker links
- English-only pages: 404, privacy-policy, terms-of-service
- Internal links auto-prefixed for non-English locales (e.g., `/es/college-consulting/`)
- hreflang tags injected automatically per page

## Brand Colors
- Navy `#044d76` (primary), Blue `#01a2e8` (accent), Muted `#9DC3D5` (footer bg)
- Font families: `font-jost` (body), `font-poppins` (footer, secondary)

## JS Architecture (`assets/js/main.js`)
- `loadComponents()` — fetches header/footer/contact HTML (dev fallback; build-injected in dist/)
- `initCookieConsent()` — cookie consent banner, stores preference in localStorage (`ivypi_cookie_consent`)
- `loadAnalytics()` — GA4 loaded only after consent (Measurement ID: `G-PQ0WS1ZJ0C`)
- Page-specific inits: tabs, FAQ accordion, carousels, testimonial carousel, shiny text, contact form
- IntersectionObserver for scroll animations, rAF throttling for perf

## Security
- **CSP header** in `_headers` — restricts script/style/connect sources
- **Security headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **Cookie consent** — GA4 only loads after explicit user consent (GDPR compliance)
- No inline scripts in source (all in main.js); `'unsafe-inline'` in CSP for Tailwind/style attributes

## External Services
- **Web3Forms** — Contact form submission
- **Google Analytics (GA4)** — Analytics, gated behind cookie consent
- **Google Fonts** — Typography (Jost, Poppins, DM Serif Display)
- **Cloudflare Pages** — Hosting, CDN, security headers

## Deployment
- Cloudflare Pages serves from `dist/`
- Workflow: push to `Site-Cleanup` → auto-PR to `main` → Cloudflare deploys from `main`
- E2E tests via Playwright in separate repo (`ivypiorg/ivypi-website-tests`)
- Caching: HTML 1hr (must-revalidate), assets/images/fonts 1yr immutable
- Dashboard/login/admin routes: `Cache-Control: no-store`

## Key Patterns
- Every page has `<div id="header-placeholder">` and `<div id="footer-placeholder">`
- `.body-loading { opacity: 0 }` prevents FOUC, removed after components load
- `[data-animate]` elements fade in on scroll via IntersectionObserver
- Schema.org JSON-LD structured data on all pages
- `[data-component]` for reusable template components (CTA banners, pricing blocks)
