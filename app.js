// ============================================================
// GPWY APP.JS — Site Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initHamburger();
  const page = detectPage();
  if (page === 'home') initHome();
  else if (page === 'blog') initBlog();
  else if (page === 'post') initPost();
});

// ── Hamburger ─────────────────────────────────────────────────
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    nav.classList.toggle('open');
  });
}

// ── Page Detection ────────────────────────────────────────────
function detectPage() {
  const p = window.location.pathname;
  if (p.includes('blog.html')) return 'blog';
  if (p.includes('post.html')) return 'post';
  if (p.includes('about.html')) return 'about';
  if (p.includes('contact.html')) return 'contact';
  return 'home';
}

// ── Date Utils ────────────────────────────────────────────────
function parseDate(str) {
  if (!str) return new Date(0);
  return new Date(str);
}

function isFuture(dateStr) {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    // If date is invalid, show the post
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    // Compare date only (not time) to avoid timezone issues
    const postDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return postDate > today;
  } catch(e) { return false; }
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch(e) { return dateStr; }
}

// ── Get visible posts ─────────────────────────────────────
function getVisiblePosts() {
  if (!window.POSTS) return [];
  return POSTS;
}

// ── Post Card HTML ────────────────────────────────────────────
function postItemHTML(post) {
  const imgSrc = post.image ? `assets/${post.image}` : null;
  const thumb = imgSrc
    ? `<img src="${imgSrc}" alt="${escHtml(post.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'post-thumb-placeholder\\'>🎮</div>'">`
    : `<div class="post-thumb-placeholder">🎮</div>`;

  const excerpt = post.excerpt
    ? `<p class="post-excerpt">${post.excerpt}</p>`
    : '';

  return `
    <article class="post-item">
      <a href="post.html?id=${post.id}" class="post-thumb" aria-label="${escHtml(post.title)}">
        ${thumb}
      </a>
      <div class="post-info">
        <div class="post-date-line">${post.date || ''}${post.author ? ' &bull; by ' + post.author : ''}</div>
        <h2 class="post-title">
          <a href="post.html?id=${post.id}">${post.title}</a>
        </h2>
        ${excerpt}
        <div class="post-meta">
          <a href="post.html?id=${post.id}" class="read-more">Read More →</a>
        </div>
      </div>
    </article>
  `;
}

// ── HOME ──────────────────────────────────────────────────────
function initHome() {
  const container = document.getElementById('posts');
  if (!container) return;
  const posts = getVisiblePosts();
  if (posts.length === 0) {
    container.innerHTML = '<p style="padding:40px 0; color:var(--text-muted); text-align:center;">No posts yet — check back soon!</p>';
    return;
  }
  container.innerHTML = posts.map(postItemHTML).join('');
}

// ── BLOG ──────────────────────────────────────────────────────
function initBlog() {
  const container = document.getElementById('posts');
  if (!container) return;
  const posts = getVisiblePosts();
  container.innerHTML = posts.map(postItemHTML).join('');
}

// ── POST PAGE ─────────────────────────────────────────────────
function initPost() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const post = window.POSTS ? POSTS.find(p => p.id === id) : null;
  const container = document.getElementById('postContent');
  const related = document.getElementById('relatedPosts');

  if (!post || !container) {
    if (container) {
      container.innerHTML = `
        <div style="max-width:800px; margin:0 auto; padding:80px 24px; text-align:center;">
          <h1 style="font-family:var(--font-display); font-size:48px; color:var(--white); margin-bottom:16px;">Post Not Found</h1>
          <a href="blog.html" style="color:var(--yellow); font-weight:700;">← Back to Blog</a>
        </div>`;
    }
    return;
  }

  // Update page title and meta
  document.title = `${post.title} — Good Playing With You`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && post.excerpt) metaDesc.setAttribute('content', post.excerpt);

  // Tags HTML
  const tagsHTML = post.tags && post.tags.length
    ? `<div class="post-tags">${post.tags.map(t => `<span class="post-tag">${t}</span>`).join('')}</div>`
    : '';

  // Content
  const content = post.content || '';

  // YouTube embed
  const youtubeHTML = post.youtubeId
    ? `<div class="post-video">
        <iframe src="https://www.youtube.com/embed/${post.youtubeId}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
          title="${post.title}">
        </iframe>
      </div>`
    : '';

  container.innerHTML = `
    <div class="post-page">
      <a href="blog.html" class="back-to-blog">← Back to Blog</a>
      <div class="post-page-eyebrow">${post.date || ''}${post.author ? ' &bull; Written by ' + post.author : ''}</div>
      <h1 class="post-page-title">${post.title}</h1>
      <div class="post-page-meta">
        ${tagsHTML}
      </div>
      ${youtubeHTML}
      <div class="post-body">
        ${content}
      </div>
      <div class="post-share">
        <span>Share:</span>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}" target="_blank" class="share-btn">𝕏 Twitter</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="share-btn">Facebook</a>
      </div>
    </div>
  `;

  // Related posts
  if (related) {
    const others = getVisiblePosts().filter(p => p.id !== id).slice(0, 3);
    if (others.length > 0) {
      related.innerHTML = `
        <h2 class="section-heading">More Posts</h2>
        <div class="related-grid">
          ${others.map(p => {
            const img = p.image
              ? `<img src="assets/${p.image}" alt="${escHtml(p.title)}" loading="lazy" onerror="this.style.display='none'">`
              : '';
            return `
              <div class="related-card">
                <div class="related-card-img">${img}</div>
                <div class="related-card-body">
                  <h3 class="related-card-title"><a href="post.html?id=${p.id}">${p.title}</a></h3>
                  <span class="related-card-date">${p.date || ''}</span>
                </div>
              </div>`;
          }).join('')}
        </div>`;
    }
  }
}

// ── Contact Form ──────────────────────────────────────────────
function handleContact(e) {
  e.preventDefault();
  const note = document.getElementById('formNote');
  if (note) {
    note.textContent = "Thanks! We'll get back to you soon. 🎮";
  }
}

// ── Helpers ───────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
