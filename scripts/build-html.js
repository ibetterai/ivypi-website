const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const LOCALES_DIR = path.join(ROOT, 'locales');
const SITE_URL = 'https://www.ivypi.org';

// Supported locales — first is default (root)
const LOCALES = ['en', 'zh-CN', 'es', 'ko'];
const DEFAULT_LOCALE = 'en';

const LOCALE_META = {
  'en':    { lang: 'en',    ogLocale: 'en_US', inLanguage: 'en-US' },
  'zh-CN': { lang: 'zh-CN', ogLocale: 'zh_CN', inLanguage: 'zh-CN' },
  'es':    { lang: 'es',    ogLocale: 'es_ES', inLanguage: 'es' },
  'ko':    { lang: 'ko',    ogLocale: 'ko_KR', inLanguage: 'ko' },
};

// HTML pages to process (relative to ROOT)
const PAGES = [
  'index.html',
  '404.html',
  'college-consulting/index.html',
  'college-application/index.html',
  'high-school-application/index.html',
  'seminars/index.html',
  'about-us/index.html',
  'privacy-policy/index.html',
  'terms-of-service/index.html',
  'blog/index.html',
];

// Internal link patterns to prefix for non-English locales
const INTERNAL_HREFS = [
  '/college-consulting/',
  '/college-application/',
  '/high-school-application/',
  '/seminars/',
  '/about-us/',
  '/login/',
  '/dashboard/',
  '/booking/',
  '/availability/',
  '/admin/',
  '/student/',
  '/blog/',
];

// ── Load Locale Files ──
function loadLocales() {
  const locales = {};
  for (const locale of LOCALES) {
    const filePath = path.join(LOCALES_DIR, `${locale}.yml`);
    locales[locale] = yaml.load(fs.readFileSync(filePath, 'utf8'));
  }
  return locales;
}

// ── Flatten nested YAML object to dot-notation keys ──
function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flatten(val, fullKey));
    } else {
      result[fullKey] = String(val);
    }
  }
  return result;
}

// ── Replace {{t.scope.key}} tokens ──
function replaceTokens(html, flatLocale, locale) {
  let missing = [];
  const result = html.replace(/\{\{t\.([a-zA-Z0-9_.]+)\}\}/g, (match, key) => {
    if (key in flatLocale) {
      return flatLocale[key];
    }
    missing.push(key);
    return match; // leave unreplaced
  });
  if (missing.length) {
    console.warn(`  [${locale}] Missing keys: ${missing.join(', ')}`);
  }
  return result;
}

// ── Compute language picker hrefs for a given page and locale ──
function computeLangHrefs(page) {
  // page = 'index.html' | 'college-consulting/index.html' | '404.html' etc.
  let pagePath;
  if (page === 'index.html') {
    pagePath = '/';
  } else if (page === '404.html') {
    pagePath = '/';
  } else {
    pagePath = '/' + page.replace(/index\.html$/, '');
  }

  const hrefs = {};
  for (const loc of LOCALES) {
    if (loc === DEFAULT_LOCALE) {
      hrefs[`lang_href_${loc}`] = pagePath;
    } else {
      hrefs[`lang_href_${loc}`] = `/${loc}${pagePath}`;
    }
  }
  return hrefs;
}

// ── Replace {{lang_href_*}} tokens ──
function replaceLangHrefs(html, langHrefs) {
  return html.replace(/\{\{lang_href_([a-zA-Z0-9-]+)\}\}/g, (match, loc) => {
    const key = `lang_href_${loc}`;
    return langHrefs[key] || match;
  });
}

// ── Set <html lang="..."> ──
function setHtmlLang(html, locale) {
  return html.replace(/<html\s+lang="[^"]*"/, `<html lang="${LOCALE_META[locale].lang}"`);
}

// ── Set og:locale ──
function setOgLocale(html, locale) {
  return html.replace(
    /(<meta\s+content=")[^"]*("\s+property="og:locale"\s*\/?>)/,
    `$1${LOCALE_META[locale].ogLocale}$2`
  );
}

// ── Inject hreflang <link> tags before </head> ──
function injectHreflang(html, page) {
  let pagePath;
  if (page === 'index.html') {
    pagePath = '/';
  } else if (page === '404.html') {
    return html; // no hreflang for 404
  } else {
    pagePath = '/' + page.replace(/index\.html$/, '');
  }

  const tags = LOCALES.map(loc => {
    const href = loc === DEFAULT_LOCALE
      ? `${SITE_URL}${pagePath}`
      : `${SITE_URL}/${loc}${pagePath}`;
    return `  <link rel="alternate" hreflang="${LOCALE_META[loc].lang}" href="${href}" />`;
  });
  // x-default points to English
  tags.push(`  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${pagePath}" />`);

  return html.replace('</head>', tags.join('\n') + '\n</head>');
}

// ── Set canonical URL for non-English locales ──
function setCanonical(html, page, locale) {
  let pagePath;
  if (page === 'index.html') {
    pagePath = '/';
  } else {
    pagePath = '/' + page.replace(/index\.html$/, '');
  }

  const canonical = locale === DEFAULT_LOCALE
    ? `${SITE_URL}${pagePath}`
    : `${SITE_URL}/${locale}${pagePath}`;

  // Handle both href="..." and content="..." canonical patterns
  html = html.replace(
    /(<link\s+href=")[^"]*("\s+rel="canonical")/,
    `$1${canonical}$2`
  );

  // Update og:url
  html = html.replace(
    /(<meta\s+content=")[^"]*("\s+property="og:url")/,
    `$1${canonical}$2`
  );

  return html;
}

// ── Adjust JSON-LD inLanguage and URLs for non-English ──
function adjustJsonLd(html, page, locale) {
  if (locale === DEFAULT_LOCALE) return html;

  const meta = LOCALE_META[locale];

  // Replace inLanguage values
  html = html.replace(/"inLanguage":\s*"en-US"/g, `"inLanguage": "${meta.inLanguage}"`);

  return html;
}

// ── Prefix internal links for non-English locales ──
function prefixInternalLinks(html, locale) {
  if (locale === DEFAULT_LOCALE) return html;

  const prefix = `/${locale}`;

  for (const href of INTERNAL_HREFS) {
    // href="..." attributes
    html = html.replace(
      new RegExp(`(href=")${href.replace(/\//g, '\\/')}(")`, 'g'),
      `$1${prefix}${href}$2`
    );
    // data-link="..." attributes
    html = html.replace(
      new RegExp(`(data-link=")${href.replace(/\//g, '\\/')}(")`, 'g'),
      `$1${prefix}${href}$2`
    );
  }

  // Also prefix href="/" (home link) — but only exact href="/"
  html = html.replace(/(href=")\/(")/g, `$1${prefix}/$2`);

  // Prefix href="#..." anchors that also have data-link or are absolute — skip these
  // (anchor links like href="#services" should stay as-is)

  return html;
}

// ── Remove Google Translate remnants (defensive — already removed from source) ──
function removeGoogleTranslate(html) {
  // Remove div#google_language_translator
  html = html.replace(/<div\s+id="google_language_translator"[^>]*><\/div>\s*/g, '');
  // Remove GoogleLanguageTranslatorInit script block
  html = html.replace(/<script>\s*function\s+GoogleLanguageTranslatorInit[\s\S]*?<\/script>\s*/g, '');
  // Remove Google Translate async script
  html = html.replace(/<script\s+async\s+src="https:\/\/translate\.google\.com[^"]*"><\/script>\s*/g, '');
  return html;
}

// ── Main Build ──
function build() {
  const localeData = loadLocales();
  const flatLocales = {};
  for (const locale of LOCALES) {
    flatLocales[locale] = flatten(localeData[locale]);
  }

  // Read component files
  const header = fs.readFileSync(path.join(ROOT, 'components/header.html'), 'utf8');
  const footer = fs.readFileSync(path.join(ROOT, 'components/footer.html'), 'utf8');
  const contact = fs.readFileSync(path.join(ROOT, 'components/contact.html'), 'utf8');

  // Clean and recreate dist
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // Copy static assets (shared across locales)
  const src = path.join(ROOT, 'assets');
  if (fs.existsSync(src)) {
    fs.cpSync(src, path.join(DIST, 'assets'), { recursive: true });
  }

  // Compute content hashes for cache-busting
  function hashFile(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
  }

  const assetHashes = {};
  for (const assetPath of ['/assets/css/tailwind.css', '/assets/js/main.js']) {
    const fullPath = path.join(DIST, assetPath);
    if (fs.existsSync(fullPath)) {
      assetHashes[assetPath] = hashFile(fullPath);
    }
  }

  // Copy _headers and sitemap.xml
  for (const file of ['_headers', 'sitemap.xml', '_redirects']) {
    const fp = path.join(ROOT, file);
    if (fs.existsSync(fp)) {
      fs.cpSync(fp, path.join(DIST, file));
    }
  }

  // Process each locale × page
  for (const locale of LOCALES) {
    const flat = flatLocales[locale];

    for (const page of PAGES) {
      // English-only pages — skip for non-English locales
      const ENGLISH_ONLY_PAGES = ['404.html', 'privacy-policy/index.html', 'terms-of-service/index.html'];
      if (ENGLISH_ONLY_PAGES.includes(page) && locale !== DEFAULT_LOCALE) continue;

      const srcPath = path.join(ROOT, page);
      let html = fs.readFileSync(srcPath, 'utf8');

      // Inject components
      html = html.replace(/<div id="header-placeholder"><\/div>/, header);
      html = html.replace(/<div id="footer-placeholder"><\/div>/, footer);
      html = html.replace(/<div id="contact-placeholder"><\/div>/, contact);

      // Replace i18n tokens
      html = replaceTokens(html, flat, locale);

      // Set HTML lang attribute
      html = setHtmlLang(html, locale);

      // Set og:locale
      html = setOgLocale(html, locale);

      // Set canonical URL
      html = setCanonical(html, page, locale);

      // Inject hreflang tags
      html = injectHreflang(html, page);

      // Adjust JSON-LD for locale
      html = adjustJsonLd(html, page, locale);

      // Prefix internal links for non-English (before lang hrefs so picker links aren't affected)
      html = prefixInternalLinks(html, locale);

      // Inject language picker hrefs (after internal link prefixing)
      const langHrefs = computeLangHrefs(page);
      html = replaceLangHrefs(html, langHrefs);

      // Defensive: remove any remaining Google Translate code
      html = removeGoogleTranslate(html);

      // Append cache-busting query params to asset URLs
      for (const [assetPath, hash] of Object.entries(assetHashes)) {
        html = html.replace(
          new RegExp(`(href|src)="${assetPath.replace(/\//g, '\\/')}"`, 'g'),
          `$1="${assetPath}?v=${hash}"`
        );
      }

      // Determine output path
      let destPath;
      if (locale === DEFAULT_LOCALE) {
        destPath = path.join(DIST, page);
      } else {
        destPath = path.join(DIST, locale, page);
      }

      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, html);
      console.log(`Built: ${locale === DEFAULT_LOCALE ? '' : locale + '/'}${page}`);
    }
  }

  console.log('\nHTML build complete.');
}

build();
