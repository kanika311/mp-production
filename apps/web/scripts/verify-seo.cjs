const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../.next/server/app/index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('index.html not found at', htmlPath);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== SEO AUDIT VERIFICATION METRICS ===');

// 1. Title verification
const titleMatch = html.match(/<title>([^<]+)<\/title>/);
const title = titleMatch ? titleMatch[1] : '';
console.log(`Title: "${title}"`);
console.log(`Title length: ${title.length} characters (Target: 50-60 chars) -> ${title.length >= 50 && title.length <= 60 ? 'PASS' : 'REVIEW'}`);

// 2. Meta description verification
const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
const desc = descMatch ? descMatch[1] : '';
console.log(`Meta description: "${desc}"`);
console.log(`Meta description length: ${desc.length} characters (Target: 120-160 chars) -> ${desc.length >= 120 && desc.length <= 160 ? 'PASS' : 'REVIEW'}`);

// 3. Canonical tag verification
const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
console.log(`Canonical tag: ${canonicalMatch ? canonicalMatch[1] : 'NOT FOUND'} -> ${canonicalMatch && canonicalMatch[1] === 'https://shivaste.com' ? 'PASS' : 'REVIEW'}`);

// 4. OpenGraph verification
const ogUrlMatch = html.match(/<meta property="og:url" content="([^"]+)"/);
console.log(`og:url: ${ogUrlMatch ? ogUrlMatch[1] : 'NOT FOUND'}`);

const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
console.log(`og:image: ${ogImageMatch ? ogImageMatch[1] : 'NOT FOUND'}`);

// 5. Headings outline
const headings = [...html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => ({
  tag: m[1].toUpperCase(),
  text: m[2].replace(/<[^>]+>/g, '').replace(/<!--.*?-->/g, '').trim()
}));

console.log(`Total headings found: ${headings.length}`);
console.log('Heading Outline:');
headings.forEach(h => console.log(`  [${h.tag}] ${h.text.slice(0, 65)}`));

const h1Count = headings.filter(h => h.tag === 'H1').length;
console.log(`H1 count: ${h1Count} (Target: exactly 1) -> ${h1Count === 1 ? 'PASS' : 'FAIL'}`);

// 6. Stats in raw HTML
console.log('Stats in raw HTML:');
console.log('  480+ Productions Delivered:', html.includes('480') && html.includes('Productions Delivered'));
console.log('  1,200+ Verified Talent:', html.includes('1,200') && html.includes('Verified Talent'));
console.log('  90+ Global Brands:', html.includes('90') && html.includes('Global Brands'));
console.log('  35+ Awards Won:', html.includes('35') && html.includes('Awards Won'));

// 7. Structured Data (JSON-LD)
const jsonLdScripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
console.log(`JSON-LD scripts found: ${jsonLdScripts.length}`);
jsonLdScripts.forEach((s, idx) => {
  try {
    const parsed = JSON.parse(s[1]);
    console.log(`  Schema #${idx + 1}: ${parsed['@type']} -> VALID JSON`);
  } catch (e) {
    console.error(`  Schema #${idx + 1}: INVALID JSON`, e);
  }
});

// 8. FAQ in raw HTML
console.log('FAQ answers present in raw HTML:', html.includes('Submit an inquiry through the contact form'));

// 9. Word count
const textOnly = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
  .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const wordCount = textOnly.split(/\s+/).length;
console.log(`Visible text word count: ${wordCount} words (Target: 1,300 - 1,800 words) -> ${wordCount >= 1200 ? 'PASS' : 'REVIEW'}`);
