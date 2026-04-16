// ============================================================
// GPWY FULL SCRAPER v2
// Auto-discovers all posts from the blog index, then scrapes
// each post for: title, date, author, YouTube ID, all images,
// full content, tags, and SEO description.
//
// Run with: node scraper2.js
// ============================================================

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BLOG_INDEX_URL = 'https://www.goodplayingwithyou.com/gpwy';
const ASSETS_DIR = path.join(__dirname, 'assets');
const OUTPUT_FILE = path.join(__dirname, 'posts.js');
const IMAGE_MAP_FILE = path.join(__dirname, 'image-map.txt');

// Make sure assets folder exists
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR);

// ── Helpers ──────────────────────────────────────────────────

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    };
    const req = client.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
        const redirect = res.headers.location;
        if (redirect) return fetch(redirect.startsWith('http') ? redirect : new URL(redirect, url).href).then(resolve).catch(reject);
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    // Clean the URL - remove query params
    const cleanUrl = url.split('?')[0];
    const dest = path.join(ASSETS_DIR, filename);
    
    // Skip if already downloaded
    if (fs.existsSync(dest)) {
      console.log(`    ⏭️  Already exists: ${filename}`);
      resolve(filename);
      return;
    }

    const client = cleanUrl.startsWith('https') ? https : http;
    const options = {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };
    
    const req = client.get(cleanUrl, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirect = res.headers.location;
        if (redirect) return downloadImage(redirect, filename).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${cleanUrl}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(filename); });
      file.on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
    });
    req.on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Download timeout')); });
  });
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

function getImageExt(url) {
  const cleanUrl = url.split('?')[0];
  const match = cleanUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
  return match ? match[0].toLowerCase().replace('.jpeg', '.jpg') : '.jpg';
}

// ── Extract post URLs from index page ────────────────────────

function extractPostUrls(html) {
  const urls = new Set();
  
  // Match all links to /gpwy/ posts (not tag pages, not the index itself)
  const linkRegex = /href="(https?:\/\/www\.goodplayingwithyou\.com\/gpwy\/[^"?#]+)"/g;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    // Skip tag pages and the index
    if (!url.includes('/tag/') && url !== 'https://www.goodplayingwithyou.com/gpwy') {
      urls.add(url);
    }
  }
  
  // Also check relative URLs
  const relLinkRegex = /href="(\/gpwy\/[^"?#]+)"/g;
  while ((match = relLinkRegex.exec(html)) !== null) {
    const path = match[1];
    if (!path.includes('/tag/') && path !== '/gpwy') {
      urls.add('https://www.goodplayingwithyou.com' + path);
    }
  }
  
  return Array.from(urls);
}

// ── Extract everything from a post page ──────────────────────

function extractPostData(html, url) {
  const post = { url };

  // ── Title ──
  const titleMatch = html.match(/<meta itemprop="headline" content="([^"]+)"/);
  if (titleMatch) {
    post.title = titleMatch[1]
      .replace(/&mdash;/g, '—')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\u2014/g, '—')
      .trim();
  }

  // ── Date ──
  const dateMatch = html.match(/<meta itemprop="datePublished" content="([^"]+)"/);
  if (dateMatch) {
    try {
      const d = new Date(dateMatch[1]);
      post.date = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch(e) {
      post.date = dateMatch[1];
    }
  }

  // ── Author ──
  const authorMatch = html.match(/<meta itemprop="author" content="([^"]+)"/);
  post.author = authorMatch ? authorMatch[1] : 'GPWY';

  // ── SEO Description ──
  const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
  if (descMatch) {
    post.seoDescription = descMatch[1]
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .trim();
  }

  // ── Featured Image (og:image) ──
  const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  post.featuredImageUrl = ogImageMatch ? ogImageMatch[1].split('?')[0] : null;

  // ── YouTube Video ID ──
  const ytMatch = html.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  post.youtubeId = ytMatch ? ytMatch[1] : null;

  // ── Tags ──
  const tags = [];
  const tagRegex = /class="blog-item-tag[^"]*"[^>]*>([^<]+)<\/a>/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(html)) !== null) {
    const tag = tagMatch[1].trim();
    if (tag && !tags.includes(tag)) tags.push(tag);
  }
  post.tags = tags;

  // ── Article Images (from data-src inside article content) ──
  const images = [];
  const imgRegex = /data-src="(https:\/\/images\.squarespace-cdn\.com\/content\/v1\/[^"]+)"/g;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const imgUrl = imgMatch[1].split('?')[0];
    // Skip the header logo and favicon
    if (!imgUrl.includes('Header_Logo') && 
        !imgUrl.includes('favicon') &&
        !imgUrl.includes('Logo+profile') &&
        !images.includes(imgUrl)) {
      images.push(imgUrl);
    }
  }
  post.imageUrls = images;

  // ── Full Article Content ──
  // Extract from sqs-html-content blocks
  const contentBlocks = [];
  const contentRegex = /<div class="sqs-html-content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
  let contentMatch;
  while ((contentMatch = contentRegex.exec(html)) !== null) {
    const block = contentMatch[1];
    // Skip blocks that are footer/navigation content
    if (!block.includes('TikTok') && 
        !block.includes('LinkTree') && 
        !block.includes('Buy Us Coffee') &&
        !block.includes('RSS Feed') &&
        !block.includes('InstantRiot') &&
        !block.includes('Instant Riot') &&
        !block.includes('GEEKGIFT') &&
        !block.includes('instantriot.com') &&
        block.trim().length > 50) {
      
      // Clean the block
      let cleaned = block
        // Remove style tags
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        // Remove data attributes
        .replace(/ data-[a-z-]+="[^"]*"/g, '')
        // Remove style attributes  
        .replace(/ style="[^"]*"/g, '')
        // Remove class attributes
        .replace(/ class="[^"]*"/g, '')
        // Clean up empty attributes
        .replace(/ >/g, '>')
        // Remove Instant Riot promotional paragraphs
        .replace(/<p[^>]*>[\s\S]*?Instant Riot[\s\S]*?<\/p>/gi, '')
        .replace(/<p[^>]*>[\s\S]*?InstantRiot[\s\S]*?<\/p>/gi, '')
        .replace(/<p[^>]*>[\s\S]*?GEEKGIFT[\s\S]*?<\/p>/gi, '')
        .replace(/<h2[^>]*>[\s\S]*?Where to Grab[\s\S]*?<\/h2>/gi, '')
        // Decode HTML entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&mdash;/g, '—')
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&rdquo;/g, '"')
        .replace(/&ldquo;/g, '"')
        // Clean up excessive whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      if (cleaned.length > 50) {
        contentBlocks.push(cleaned);
      }
    }
  }

  // Also extract image blocks and video embeds to interleave with content
  const allBlocks = [];
  
  // Add YouTube embed at top if exists
  if (post.youtubeId) {
    allBlocks.push(`<div class="post-video"><iframe width="560" height="315" src="https://www.youtube.com/embed/${post.youtubeId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="${post.title || 'GPWY Podcast'}"></iframe></div>`);
  }

  // Add content blocks
  allBlocks.push(...contentBlocks);

  post.content = allBlocks.join('\n\n');

  return post;
}

// ── Generate keywords for SEO ─────────────────────────────────

function generateKeywords(title, tags, content) {
  const base = ['gaming podcast', 'video games', 'game reviews', 'gaming news', 'GPWY'];
  const titleWords = title ? title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 4) : [];
  const allKeywords = [...new Set([...base, ...tags.map(t => t.toLowerCase()), ...titleWords])];
  return allKeywords.slice(0, 10).join(', ');
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log('\n🎮 GPWY Full Scraper v2 Starting...\n');

  // Step 1: Fetch blog index to get all post URLs
  console.log('📡 Fetching blog index page...');
  let indexHtml;
  try {
    indexHtml = await fetch(BLOG_INDEX_URL);
    console.log(`✅ Index page fetched (${indexHtml.length} bytes)`);
  } catch(e) {
    console.error('❌ Failed to fetch index:', e.message);
    process.exit(1);
  }

  // Step 2: Extract post URLs
  const postUrls = extractPostUrls(indexHtml);
  console.log(`\n🔗 Found ${postUrls.length} post URLs:`);
  postUrls.forEach((url, i) => console.log(`   ${i+1}. ${url}`));

  if (postUrls.length === 0) {
    console.error('❌ No post URLs found. Check the blog index page.');
    process.exit(1);
  }

  // Step 3: Scrape each post
  const posts = [];
  const imageMap = [];

  for (let i = 0; i < postUrls.length; i++) {
    const url = postUrls[i];
    console.log(`\n[${i+1}/${postUrls.length}] Scraping: ${url}`);
    
    let html;
    try {
      html = await fetch(url);
      console.log(`  ✅ Page fetched (${html.length} bytes)`);
    } catch(e) {
      console.log(`  ❌ Failed to fetch: ${e.message}`);
      continue;
    }

    const postData = extractPostData(html, url);
    console.log(`  📝 Title: ${postData.title || 'Unknown'}`);
    console.log(`  📅 Date: ${postData.date || 'Unknown'}`);
    console.log(`  👤 Author: ${postData.author || 'Unknown'}`);
    console.log(`  🎬 YouTube: ${postData.youtubeId || 'None'}`);
    console.log(`  🏷️  Tags: ${postData.tags.join(', ') || 'None'}`);
    console.log(`  🖼️  Images found: ${postData.imageUrls.length}`);

    // Download images
    const downloadedImages = [];
    const id = slugify(postData.title || `post-${i+1}`);
    
    for (let j = 0; j < postData.imageUrls.length; j++) {
      const imgUrl = postData.imageUrls[j];
      const ext = getImageExt(imgUrl);
      const imgFilename = `${id}-img${j+1}${ext}`;
      
      try {
        await downloadImage(imgUrl, imgFilename);
        downloadedImages.push(imgFilename);
        console.log(`    📸 Downloaded: ${imgFilename}`);
      } catch(e) {
        console.log(`    ⚠️  Image ${j+1} failed: ${e.message}`);
      }
      
      // Small delay between image downloads
      await new Promise(r => setTimeout(r, 300));
    }

    // Download featured image if not already in the list
    let featuredImage = downloadedImages[0] || '';
    if (postData.featuredImageUrl && downloadedImages.length === 0) {
      const ext = getImageExt(postData.featuredImageUrl);
      const featuredFilename = `${id}-featured${ext}`;
      try {
        await downloadImage(postData.featuredImageUrl, featuredFilename);
        featuredImage = featuredFilename;
        downloadedImages.unshift(featuredFilename);
        console.log(`    📸 Featured image: ${featuredFilename}`);
      } catch(e) {
        console.log(`    ⚠️  Featured image failed: ${e.message}`);
      }
    }

    // Add inline image tags to content after each content block
    let fullContent = postData.content;
    
    // Replace any remaining squarespace image URLs in content with local paths
    downloadedImages.forEach((localFile, idx) => {
      if (postData.imageUrls[idx]) {
        const sqsUrl = postData.imageUrls[idx];
        fullContent = fullContent.replace(new RegExp(sqsUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `assets/${localFile}`);
      }
    });

    const keywords = generateKeywords(postData.title, postData.tags, fullContent);

    posts.push({
      id,
      title: postData.title || 'Untitled',
      date: postData.date || '',
      author: postData.author || 'GPWY',
      image: featuredImage,
      images: downloadedImages,
      youtubeId: postData.youtubeId || '',
      tags: postData.tags,
      excerpt: postData.seoDescription || '',
      keywords,
      content: fullContent
    });

    // Image map entry
    imageMap.push(`\n=== ${postData.title} ===`);
    imageMap.push(`URL: ${url}`);
    imageMap.push(`Featured: ${featuredImage}`);
    downloadedImages.forEach((img, idx) => imageMap.push(`Image ${idx+1}: ${img}`));

    // Polite delay between posts
    await new Promise(r => setTimeout(r, 1000));
  }

  // Sort posts by date (newest first)
  posts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  // Step 4: Write posts.js
  console.log('\n💾 Writing posts.js...');

  const postsJs = `// ============================================================
// GPWY BLOG POSTS
// Auto-generated by scraper2.js on ${new Date().toLocaleDateString()}
// Total posts: ${posts.length}
// ============================================================
//
// HOW TO ADD A NEW POST:
// 1. Copy one post object below as a template
// 2. Paste it at the TOP of the POSTS array (newest first)
// 3. Fill in all fields
// 4. Put your image in the assets/ folder
// 5. Save and upload to GitHub via GitHub Desktop
//
// FIELDS:
//   id:        short slug, no spaces (e.g. "my-new-post")
//   title:     post title
//   date:      "Month D, YYYY" (e.g. "April 15, 2026")
//   author:    "Dan Whitehill" or "Zach Kohler" etc.
//   image:     filename in assets/ folder, or "" for none
//   youtubeId: YouTube video ID (e.g. "nnNouRn-oqk"), or ""
//   tags:      array of tag strings
//   excerpt:   1-2 sentence preview shown on blog listing
//   keywords:  comma-separated SEO keywords
//   content:   full HTML content of the post
// ============================================================

const POSTS = [
${posts.map(p => `  {
    id: ${JSON.stringify(p.id)},
    title: ${JSON.stringify(p.title)},
    date: ${JSON.stringify(p.date)},
    author: ${JSON.stringify(p.author)},
    image: ${JSON.stringify(p.image)},
    youtubeId: ${JSON.stringify(p.youtubeId)},
    tags: ${JSON.stringify(p.tags)},
    excerpt: ${JSON.stringify(p.excerpt)},
    keywords: ${JSON.stringify(p.keywords)},
    content: \`
${p.content.replace(/`/g, '\\`').replace(/\${/g, '\\${')}
    \`
  }`).join(',\n\n')}
];
`;

  fs.writeFileSync(OUTPUT_FILE, postsJs, 'utf8');
  console.log(`✅ posts.js written with ${posts.length} posts`);

  // Step 5: Write image map
  fs.writeFileSync(IMAGE_MAP_FILE, imageMap.join('\n'), 'utf8');
  console.log(`✅ image-map.txt written`);

  console.log(`\n📁 Images saved to: ${ASSETS_DIR}`);
  console.log(`\n🎉 Done! ${posts.length} posts scraped successfully.\n`);
  console.log('Next steps:');
  console.log('  1. Check image-map.txt to see what was downloaded');
  console.log('  2. Open GitHub Desktop and commit the changes');
  console.log('  3. Push to GitHub\n');
}

main().catch(e => {
  console.error('\n❌ Fatal error:', e.message);
  console.error(e.stack);
  process.exit(1);
});