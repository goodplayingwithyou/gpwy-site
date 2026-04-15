# Good Playing With You — Website Files

## Files Overview

| File | What it does |
|------|-------------|
| `index.html` | Homepage |
| `blog.html` | Full blog listing |
| `post.html` | Individual post viewer |
| `about.html` | About the guys |
| `contact.html` | Contact form |
| `style.css` | All the visual design |
| `app.js` | Site logic (don't edit) |
| `posts.js` | **YOUR BLOG — EDIT THIS TO ADD POSTS** |
| `assets/` | Put images here |

---

## How to Add a New Blog Post

Open `posts.js` in any text editor (Notepad, TextEdit, VS Code).

At the very **top** of the `POSTS` array (right after `const POSTS = [`), paste this template and fill it in:

```js
{
  id: "your-post-slug-here",
  title: "Your Post Title Here",
  date: "April 15, 2026",
  image: "",
  excerpt: "A 1-2 sentence preview of the post that appears on the blog page.",
  content: `
    <p>Your first paragraph here.</p>
    <p>Another paragraph.</p>
    <h3>A Section Heading</h3>
    <p>More content here.</p>
  `
},
```

**Rules:**
- `id`: lowercase, no spaces, use dashes — e.g. `"resident-evil-9-review"`
- `date`: write it out — e.g. `"April 15, 2026"`
- `image`: leave as `""` if no image, or put the filename like `"my-image.jpg"` (image must be in the `assets/` folder)
- Make sure each post ends with `},` and the last post does NOT have a comma

---

## How to Add an Image to a Post

1. Put the image file in the `assets/` folder
2. In `posts.js`, set `image: "your-filename.jpg"`

---

## Uploading to GitHub Pages

After editing posts.js or any file:

1. Open **GitHub Desktop**
2. It will show the changed files
3. Type a short message like "Added new post"
4. Click **Commit to main**
5. Click **Push origin**

Your site updates in ~1 minute.

---

## Adding Your Logo & Photos

Put these files in the `assets/` folder:

| Filename | Used for |
|----------|----------|
| `logo.png` | Header logo |
| `team.jpg` | About page group photo |
| `dan.jpg` | Dan's headshot |
| `matt-lord.jpg` | Matt Lord's headshot |

The site will show emoji placeholders until you add real images.
