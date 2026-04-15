// ============================================================
// GPWY APP.JS — Site Logic
// ============================================================

// --- Hamburger Menu ---
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
  }

  // Run page-specific logic
  const page = detectPage();
  if (page === 'home') initHome();
  else if (page === 'blog') initBlog();
  else if (page === 'post') initPost();
});

function detectPage() {
  const path = window.location.pathname;
  if (path.includes('blog.html')) return 'blog';
  if (path.includes('post.html')) return 'post';
  if (path.includes('about.html')) return 'about';
  if (path.includes('contact.html')) return 'contact';
  return 'home';
}

// --- Helpers ---
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function postCard(post, large = false) {
  return `
    <article class="post-card ${large ? 'post-card--large' : ''}">
      ${post.image ? `<div class="post-card-img"><img src="assets/${post.image}" alt="${post.title}" loading="lazy"></div>` : `<div class="post-card-img post-card-img--empty"><span>🎮</span></div>`}
      <div class="post-card-body">
        <time class="post-date">${post.date}</time>
        <h2 class="post-card-title"><a href="post.html?id=${post.id}">${post.title}</a></h2>
        <p class="post-card-excerpt">${post.excerpt}</p>
        <a href="post.html?id=${post.id}" class="read-more">Read More →</a>
      </div>
    </article>
  `;
}

// --- HOME PAGE ---
function initHome() {
  if (!POSTS || POSTS.length === 0) return;

  // Featured post (first/latest)
  const featured = document.getElementById('featuredPost');
  if (featured) {
    featured.innerHTML = postCard(POSTS[0], true);
  }

  // Recent posts (next 6)
  const recent = document.getElementById('recentPosts');
  if (recent) {
    const posts = POSTS.slice(1, 7);
    recent.innerHTML = posts.map(p => postCard(p)).join('');
  }
}

// --- BLOG PAGE ---
function initBlog() {
  const container = document.getElementById('allPosts');
  if (!container || !POSTS) return;
  container.innerHTML = POSTS.map(p => postCard(p)).join('');
}

// --- POST PAGE ---
function initPost() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const post = POSTS.find(p => p.id === id);
  const container = document.getElementById('postContent');

  if (!post || !container) {
    if (container) {
      container.innerHTML = `<div class="container post-not-found"><h1>Post not found</h1><a href="blog.html">← Back to Blog</a></div>`;
    }
    return;
  }

  // Update page title
  document.title = `${post.title} — Good Playing With You`;

  container.innerHTML = `
    <div class="post-hero">
      ${post.image ? `<img src="assets/${post.image}" alt="${post.title}" class="post-hero-img">` : ''}
      <div class="container">
        <a href="blog.html" class="back-link">← Back to Blog</a>
        <time class="post-date">${post.date}</time>
        <h1 class="post-title">${post.title}</h1>
      </div>
    </div>
    <div class="container post-body">
      ${post.content}
    </div>
    <div class="container post-share">
      <span>Share this post:</span>
      <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}" target="_blank" class="share-btn">𝕏 Twitter</a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="share-btn">Facebook</a>
    </div>
  `;

  // Related posts (exclude current, show 3)
  const related = document.getElementById('relatedPosts');
  if (related) {
    const others = POSTS.filter(p => p.id !== id).slice(0, 3);
    related.innerHTML = others.map(p => postCard(p)).join('');
  }
}

// --- EMAIL SIGNUP ---
function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type=email]').value;
  form.innerHTML = `<p class="signup-success">Thanks! We'll be in touch. 🎮</p>`;
}

// --- CONTACT FORM ---
function handleContact(e) {
  e.preventDefault();
  const note = document.getElementById('formNote');
  if (note) {
    note.textContent = "Thanks for reaching out! We'll get back to you soon.";
    note.style.color = 'var(--accent)';
  }
  // Note: for a real form submission, add a service like Formspree or Netlify Forms
}
