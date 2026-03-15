const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const LOCALES = ['en', 'zh-CN', 'es', 'ko'];
const DEFAULT_LOCALE = 'en';

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

let hasErrors = false;

// Load and flatten all locales
const data = {};
for (const locale of LOCALES) {
  const filePath = path.join(LOCALES_DIR, `${locale}.yml`);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing locale file: ${locale}.yml`);
    hasErrors = true;
    continue;
  }
  data[locale] = flatten(yaml.load(fs.readFileSync(filePath, 'utf8')));
}

if (!data[DEFAULT_LOCALE]) {
  console.error(`Default locale ${DEFAULT_LOCALE}.yml is missing. Cannot validate.`);
  process.exit(1);
}

const enKeys = Object.keys(data[DEFAULT_LOCALE]).sort();
console.log(`Reference locale (${DEFAULT_LOCALE}): ${enKeys.length} keys\n`);

for (const locale of LOCALES) {
  if (locale === DEFAULT_LOCALE || !data[locale]) continue;

  const localeKeys = new Set(Object.keys(data[locale]));
  const missing = enKeys.filter(k => !localeKeys.has(k));
  const extra = [...localeKeys].filter(k => !data[DEFAULT_LOCALE][k]).sort();

  if (missing.length === 0 && extra.length === 0) {
    console.log(`${locale}: OK (${localeKeys.size} keys)`);
  } else {
    if (missing.length) {
      hasErrors = true;
      console.error(`${locale}: ${missing.length} missing key(s):`);
      missing.forEach(k => console.error(`  - ${k}`));
    }
    if (extra.length) {
      console.warn(`${locale}: ${extra.length} extra key(s):`);
      extra.forEach(k => console.warn(`  + ${k}`));
    }
  }
}

if (hasErrors) {
  console.error('\nValidation failed.');
  process.exit(1);
} else {
  console.log('\nAll locale files are valid.');
}
