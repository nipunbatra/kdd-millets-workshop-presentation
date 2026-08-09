import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const strict = process.argv.includes('--strict');
const entry = path.join(root, 'index.html');
const html = fs.readFileSync(entry, 'utf8');

const expectedArtifacts = new Set([
  'presentation/index.html',
  'downloads/kdd-millets-feature-ssl-strong.md',
  'downloads/kdd-millets-feature-ssl-strong.html',
  'downloads/kdd-millets-feature-ssl-strong.pdf',
  'downloads/kdd-millets-feature-ssl-strong.pptx',
  'downloads/source.zip',
  'downloads/svg-assets.zip',
]);

const references = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map((match) => match[1]);
const localReferences = references.filter((ref) => !/^(?:https?:|mailto:|tel:|data:|#)/.test(ref));
const missing = [];
const staged = [];

for (const ref of localReferences) {
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) continue;
  const target = path.resolve(root, clean);
  if (fs.existsSync(target)) continue;
  if (expectedArtifacts.has(clean) && !strict) {
    staged.push(clean);
  } else {
    missing.push(clean);
  }
}

for (const expected of expectedArtifacts) {
  if (!references.some((ref) => ref.split('#')[0].split('?')[0] === expected)) {
    missing.push(`${expected} (not referenced by index.html)`);
  }
}

const placeholderPath = path.join(root, 'presentation/index.html');
if (strict && fs.existsSync(placeholderPath)) {
  const presentation = fs.readFileSync(placeholderPath, 'utf8');
  if (presentation.includes('data-site-placeholder="true"')) {
    missing.push('presentation/index.html is still the staging placeholder');
  }
}

if (staged.length) {
  console.log('Staged artifact targets (allowed until the final build is copied):');
  for (const item of [...new Set(staged)].sort()) console.log(`  - ${item}`);
}

if (missing.length) {
  console.error('Site validation failed:');
  for (const item of [...new Set(missing)].sort()) console.error(`  - ${item}`);
  process.exit(1);
}

console.log(`Site validation passed${strict ? ' in strict mode' : ' in skeleton mode'}.`);
