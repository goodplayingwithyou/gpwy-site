// ============================================================
// GPWY SITE SCRAPER
// Pulls all posts + images from goodplayingwithyou.com
// Run with: node scraper.js
// ============================================================

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BLOG_URL = 'https://www.goodplayingwithyou.com/gpwy';
const RSS_URL = 'https://www.goodplayingwithyou.com/gpwy?format=rss';
const ASSETS_DIR = path.join(__dirname, 'assets');
const OUTPUT_FILE = path.join(__dirname, 'posts.js');

// Make sure assets folder exists
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR);

// ── Helpers ──────────────────────────────────────────────────

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(ASSETS_DIR, filename);
    if (fs.existsSync(dest)) { resolve(filename); return; }
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filename).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(filename); });
    });
    req.on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').trim();
}

function extractImageUrl(html) {
  const match = html.match(/https:\/\/images\.squarespace-cdn\.com\/[^"'\s)>]+/);
  return match ? match[0].split('?')[0] : null;
}

function getImageExt(url) {
  const match = url.match(/\.(jpg|jpeg|png|webp|gif)/i);
  return match ? match[0].toLowerCase() : '.jpg';
}

function generateExcerpt(html) {
  const text = stripHtml(html);
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, 2).join(' ').trim().substring(0, 200);
}

function generateKeywords(title, content) {
  const text = (title + ' ' + stripHtml(content)).toLowerCase();
  const gaming = ['game', 'gaming', 'xbox', 'playstation', 'nintendo', 'pc', 'steam', 'review', 
    'podcast', 'switch', 'fps', 'rpg', 'multiplayer', 'indie', 'sequel', 'dlc', 'early access',
    'esports', 'controller', 'console', 'graphics', 'gameplay', 'trailer', 'release'];
  const found = gaming.filter(k => text.includes(k));
  return ['gaming podcast', 'video games', 'game reviews', 'gaming news', ...found].slice(0, 8).join(', ');
}

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                  item.match(/<title>(.*?)<\/title>/)?.[1] || '';
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || 
                 item.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] || '';
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    const description = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
                        item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
    const content = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] || description;
    
    if (title && link) {
      items.push({ title: title.trim(), link: link.trim(), pubDate, description, content });
    }
  }
  return items;
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log('\n🎮 GPWY Site Scraper Starting...\n');

  // Step 1: Fetch RSS
  console.log('📡 Fetching RSS feed...');
  let rssXml;
  try {
    rssXml = await fetch(RSS_URL);
    console.log(`✅ RSS feed fetched (${rssXml.length} bytes)`);
  } catch (e) {
    console.error('❌ Failed to fetch RSS:', e.message);
    process.exit(1);
  }

  // Step 2: Parse posts
  console.log('\n📝 Parsing posts...');
  const items = parseRSS(rssXml);
  console.log(`✅ Found ${items.length} posts`);

  if (items.length === 0) {
    console.log('⚠️  No posts found in RSS. Trying page scrape...');
    // fallback below
  }

  // Step 3: For each post, fetch full page and download image
  const posts = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`\n[${i+1}/${items.length}] ${item.title}`);

    const id = slugify(item.title).substring(0, 60);
    const date = formatDate(item.pubDate);
    let imageFile = '';
    let fullContent = item.content || item.description;

    // Fetch full post page for better content + image
    try {
      const pageHtml = await fetch(item.link);
      
      // Try to get a better image from the page
      const imgUrl = extractImageUrl(pageHtml);
      if (imgUrl) {
        const ext = getImageExt(imgUrl);
        const imgFilename = id.substring(0, 40) + ext;
        try {
          await downloadImage(imgUrl, imgFilename);
          imageFile = imgFilename;
          console.log(`  📸 Image: ${imgFilename}`);
        } catch (e) {
          console.log(`  ⚠️  Image download failed: ${e.message}`);
        }
      }

      // Try to extract better content from page
      const articleMatch = pageHtml.match(/<div[^>]*class="[^"]*sqs-block-content[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      if (articleMatch) {
        fullContent = articleMatch[1];
      }

    } catch (e) {
      console.log(`  ⚠️  Page fetch failed: ${e.message}`);
    }

    // Clean up content
    const cleanContent = fullContent
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/class="[^"]*"/g, '')
      .replace(/style="[^"]*"/g, '')
      .replace(/<div>/g, '')
      .replace(/<\/div>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const excerpt = generateExcerpt(fullContent);
    const keywords = generateKeywords(item.title, fullContent);

    posts.push({
      id,
      title: item.title,
      date,
      image: imageFile,
      excerpt,
      keywords,
      content: cleanContent
    });

    // Small delay to be polite to the server
    await new Promise(r => setTimeout(r, 800));
  }

  // Step 4: Write posts.js
  console.log('\n💾 Writing posts.js...');
  
  const postsJs = `// ============================================================
// GPWY BLOG POSTS — Auto-generated by scraper
// Last updated: ${new Date().toLocaleDateString()}
// ============================================================
// HOW TO ADD A NEW POST:
// 1. Copy one of the post objects below
// 2. Paste it at the TOP of the array (newest first)
// 3. Fill in: id, title, date, excerpt, keywords, content, image
// 4. Save and upload to GitHub
// ============================================================

const POSTS = [
${posts.map(p => `  {
    id: "${p.id}",
    title: ${JSON.stringify(p.title)},
    date: "${p.date}",
    image: "${p.image}",
    excerpt: ${JSON.stringify(p.excerpt)},
    keywords: "${p.keywords}",
    content: \`
${p.content}
    \`
  }`).join(',\n')}
];
`;

  fs.writeFileSync(OUTPUT_FILE, postsJs, 'utf8');
  console.log(`✅ posts.js written with ${posts.length} posts`);
  console.log(`📁 Images saved to: ${ASSETS_DIR}`);
  console.log('\n🎉 Done! Your posts and images have been scraped successfully.\n');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});