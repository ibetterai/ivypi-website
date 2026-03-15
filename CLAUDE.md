# IvyPi Website

## Structure
- Static site hosted on Cloudflare Pages (ivypi.org)
- 6 pages + 404: index, college-consulting, college-application, high-school-application, seminars, about-us
- Shared components loaded dynamically: `components/header.html`, `components/footer.html`

## File Structure
```
├── index.html                     # Homepage
├── about-us/index.html            # About Us page
├── college-consulting/index.html  # College Consulting page
├── college-application/index.html # College Application page
├── high-school-application/index.html # High School Application page
├── seminars/index.html            # Seminars page
├── 404.html                       # Custom 404 page
├── components/
│   ├── header.html                # Shared header (loaded dynamically)
│   ├── footer.html                # Shared footer (loaded dynamically)
│   └── contact.html               # Contact form component
├── assets/
│   ├── css/
│   │   ├── main.css               # Tailwind source (authoring)
│   │   └── tailwind.css           # Compiled Tailwind output
│   ├── js/
│   │   └── main.js                # All site JS (~290 lines)
│   └── images/                    # All images (WebP + legacy JPEG/PNG)
├── locales/                       # i18n translation files
│   ├── en.yml                     # English (source)
│   ├── es.yml                     # Spanish
│   ├── ko.yml                     # Korean
│   └── zh-CN.yml                  # Simplified Chinese
├── scripts/
│   ├── build-html.js              # Generates localized HTML into dist/
│   └── validate-i18n.js           # Validates translation completeness
├── dist/                          # Build output (deployed to Cloudflare)
│   ├── (en pages at root)         # English pages copied to dist root
│   ├── es/                        # Spanish localized pages
│   ├── ko/                        # Korean localized pages
│   └── zh-CN/                     # Chinese localized pages
├── .github/workflows/auto-pr.yml  # Auto-PR: Site-Cleanup → main
├── tailwind.config.js             # Tailwind configuration
├── package.json                   # npm scripts and dependencies
├── _headers                       # Cloudflare Pages caching headers
├── sitemap.xml                    # XML sitemap
└── robots.txt                     # Robots crawl rules
```

## Tech Stack
- Tailwind CSS v4.2 (source: `assets/css/main.css` → compiled: `assets/css/tailwind.css`)
- Vanilla JS (`assets/js/main.js`, ~290 lines, no frameworks)
- Google Fonts: Jost (300/400/600), Poppins (400/500/600) — loaded via CSS `@import`

## Build & Dev
- `npm run build` — full build (Tailwind CSS + localized HTML into `dist/`)
- `npm run build:css` — compile Tailwind only (minified)
- `npm run build:html` — generate localized HTML into `dist/` only
- `npm run dev` — build and serve from `dist/` (correct way to preview locally)
- `npm run watch:css` — auto-recompile CSS on changes
- **Important:** Always serve from `dist/`, not the project root — source HTML contains `{{t.*}}` locale tokens that only get replaced during `npm run build:html`
- After changing HTML or locale YAML files, re-run `npm run build:html` to regenerate `dist/`
- No bundler — pure static HTML/CSS/JS

## Brand Colors
- Navy `#044d76` (primary), Blue `#01a2e8` (accent), Muted `#9DC3D5` (footer bg)
- Font families: `font-jost` (body), `font-poppins` (footer, secondary)

## JS Architecture
- `loadComponents()` — fetches header/footer HTML via fetch API
- Conditional feature init (tabs, FAQ, carousels, contact form, testimonials, shiny text)
- IntersectionObserver for scroll animations, rAF throttling for perf

## External Services
- Web3Forms (contact form submission)
- Google Translate (language selector widget)
- Google Fonts (via CSS import)

## Images
- WebP migration in progress (~50% complete), legacy JPEG/PNG remain
- Categories: hero/bg, school logos (11), university logos (9), seminar posters (5), favicons

## Deployment
- Cloudflare Pages serves from `dist/` — must run `npm run build` before deploying
- Build command: `npm run build` (compiles Tailwind CSS + generates localized HTML into `dist/`)
- Workflow: push to `Site-Cleanup` → auto-PR to `main` → Cloudflare deploys from `main`
- E2E tests via Playwright in separate repo (`ivypiorg/ivypi-website-tests`)
- Caching: HTML 1hr, assets/images/fonts 1yr immutable

## Key Patterns
- Every page has `<div id="header-placeholder">` and `<div id="footer-placeholder">`
- `.body-loading { opacity: 0 }` prevents FOUC, removed after components load
- `[data-animate]` elements fade in on scroll via IntersectionObserver
- Schema.org JSON-LD structured data on all pages
