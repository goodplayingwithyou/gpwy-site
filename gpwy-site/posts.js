// ============================================================
// GPWY BLOG POSTS
// ============================================================
// HOW TO ADD A NEW POST:
// 1. Copy one of the post objects below
// 2. Paste it at the TOP of the array (so newest shows first)
// 3. Fill in: id, title, date, excerpt, content, image (optional)
// 4. Save the file and upload it to GitHub
//
// DATE FORMAT: "Month D, YYYY" — e.g. "April 15, 2026"
// ID: Use a short slug, no spaces — e.g. "slay-the-spire-2-review"
// IMAGE: Put image files in the assets/ folder, use filename here
//        Leave as "" if no image
// ============================================================

const POSTS = [
  {
    id: "slay-the-spire-2-early-access",
    title: "Slay the Spire 2 — Should You Play Now or Wait?",
    date: "April 2, 2026",
    image: "",
    excerpt: "There's something oddly poetic about Slay the Spire 2 launching in early access and immediately pulling in hundreds of thousands of players. But should you jump in now — or wait for the full release?",
    content: `
      <p>There's something oddly poetic about <strong>Slay the Spire 2</strong> launching in early access and immediately pulling in hundreds of thousands of players.</p>
      <p>Not because it's surprising — but because it proves just how powerful a slow-burn success story can be.</p>
      <p>The original Slay the Spire didn't explode overnight. It built its reputation over time, quietly converting skeptics into die-hard fans. And now? The sequel is reaping the rewards of that goodwill.</p>
      <h3>But here's the real question:</h3>
      <p><strong>Should you jump into Slay the Spire 2 right now — or wait for the full release?</strong></p>
      <p>Early access means you're getting an unfinished product. But "unfinished" in the case of Slay the Spire 2 still means more content than most finished games. The core loop is airtight. New cards, new mechanics, new characters — it's all already here.</p>
      <p>Our take: if you loved the original, there's no reason to wait. If you're new to the series, maybe grab the first one while this one cooks.</p>
    `
  },
  {
    id: "toxic-commando-review",
    title: "Toxic Commando Review — Fun Zombie Chaos or a Missed Opportunity?",
    date: "March 30, 2026",
    image: "",
    excerpt: "Sometimes a game knows exactly what it is. Explosions. Zombies. One-liners. Absolute chaos. That's the promise of John Carpenter's Toxic Commando — and it mostly delivers.",
    content: `
      <p>Sometimes a game knows exactly what it is.</p>
      <p>Explosions. Zombies. One-liners. Absolute chaos.</p>
      <p>That's the promise of <strong>John Carpenter's Toxic Commando</strong> — a budget-priced, co-op shooter that leans hard into B-movie energy. And to its credit, it mostly delivers on that vibe.</p>
      <p>But after spending real time with it, one thing becomes clear: this is a game that's fun in bursts — but struggles to go the distance.</p>
      <h3>What Works</h3>
      <p>The co-op chaos is genuinely fun. Grab three friends, turn your brain off, and just shoot things. The John Carpenter aesthetic is well-executed and the soundtrack slaps.</p>
      <h3>What Doesn't</h3>
      <p>Solo play feels hollow. The enemy variety thins out fast, and by hour three you're doing the exact same things you were doing in hour one.</p>
      <p><strong>Bottom line:</strong> Worth it on sale with friends. Skip it if you're rolling solo.</p>
    `
  },
  {
    id: "marathon-extraction-shooter",
    title: "Is Marathon the Next Big Extraction Shooter?",
    date: "March 26, 2026",
    image: "",
    excerpt: "When Marathon was first revealed, the reaction was skeptical. But after players finally got hands-on time, the conversation has shifted in a surprising direction.",
    content: `
      <p>When Marathon was first revealed, the reaction across the gaming community was… skeptical.</p>
      <p>Bungie stepping into the crowded extraction shooter space raised plenty of eyebrows, especially after several recent live-service titles stumbled out of the gate.</p>
      <p>But after players finally got hands-on time with the game, the conversation has shifted in a surprising direction: <strong>Marathon might actually have a future.</strong></p>
      <h3>What Changed?</h3>
      <p>The movement system. That's the short answer. Marathon moves differently than anything else in the genre, and it gives the game a distinct identity that extraction shooters desperately need.</p>
      <p>The atmosphere is also doing a lot of heavy lifting — the world feels alive in a way that's hard to pin down but impossible to ignore.</p>
      <p>Is it going to dethrone Escape From Tarkov or Hunt: Showdown? Probably not right away. But this is a serious entry in the genre, not the flop many were expecting.</p>
    `
  },
  {
    id: "resident-evil-9-impressions",
    title: "Resident Evil 9 Is Bold, Brutal, and Surprisingly Different",
    date: "March 24, 2026",
    image: "",
    excerpt: "The latest entry in Capcom's legendary horror franchise is doing something very different — and early impressions suggest it's swinging for the fences.",
    content: `
      <p>The latest entry in Capcom's legendary horror franchise is finally here, and <strong>Resident Evil 9</strong> is already sparking serious debate among fans.</p>
      <p>Early hands-on impressions suggest this installment is doing something very different with the formula — splitting the experience between two drastically different playstyles.</p>
      <p>One side leans into slow, nerve-wracking horror, while the other cranks the action up to levels the series has rarely attempted before.</p>
      <h3>Is It Working?</h3>
      <p>Divided opinion so far. Horror purists are nervous. Action fans are hyped. And somewhere in the middle is everyone else wondering if Capcom can actually stick the landing on something this ambitious.</p>
      <p>We'll have a full breakdown on the podcast this Friday. Don't miss it.</p>
    `
  },
  {
    id: "nintendo-direct-flop",
    title: "Why Nintendo Direct Was a TOTAL FLOP",
    date: "February 17, 2026",
    image: "",
    excerpt: "Nintendo's latest Partner Direct should have been an easy win. Instead, it left a lot of fans staring at their screens wondering if they just woke up early for… that.",
    content: `
      <p>Nintendo's latest Partner Direct should have been an easy win. Instead, it left a lot of fans staring at their screens wondering if they just woke up early for… that.</p>
      <p>No first-party bombshells were promised — fair enough, it was a partner showcase. But even with expectations calibrated, this presentation felt strangely flat.</p>
      <p>Old ports. Already-announced titles. Niche RPGs. Sports games. Very few surprises.</p>
      <h3>The Biggest Red Flag</h3>
      <p>Eight months into the Switch 2 lifecycle, there's still no major Mario reveal, no Zelda update, and no clear "you need this console now" moment.</p>
      <p>And when the biggest pop of the show comes from Xbox-owned titles like Fallout 4, Oblivion, and Indiana Jones? That's a weird look for a Nintendo showcase.</p>
      <p>Was this just a slow news cycle — or a genuine red flag for the Switch 2's software pipeline? We break it all down on the pod.</p>
    `
  },
  {
    id: "crimson-desert-2026-rpg",
    title: "Is Crimson Desert 2026's BIGGEST RPG?",
    date: "February 17, 2026",
    image: "",
    excerpt: "A 15-minute gameplay showcase dropped this week and suddenly Crimson Desert went from 'oh yeah, I've heard of that' to 'wait — is this the next big thing?'",
    content: `
      <p>Every once in a while, a game drops a gameplay preview that makes you sit up a little straighter.</p>
      <p>That was <strong>Crimson Desert</strong> this week.</p>
      <p>A 15-minute gameplay showcase hit YouTube, and suddenly this long-gestating fantasy epic went from "oh yeah, I've heard of that" to "wait… is this the next big thing?"</p>
      <p>The ambition on display was massive — the kind of swing that either defines a studio or becomes a cautionary tale.</p>
      <h3>What We Saw</h3>
      <p>Open world traversal that actually looks fun. Combat that feels weighty but not sluggish. A world with real visual identity — not just another grey and brown RPG landscape.</p>
      <p>Pearl Abyss has been cooking on this for years. Either they've figured something out — or they've been hiding the problems. We'll find out soon enough.</p>
    `
  },
  {
    id: "fortnite-gambling-problem",
    title: "Fortnite's New MAJOR Gambling Problem",
    date: "February 3, 2026",
    image: "",
    excerpt: "Fortnite has reinvented itself more times than almost any game on the planet. But its latest evolution may be the most troubling yet.",
    content: `
      <p>Fortnite has reinvented itself more times than almost any game on the planet. Battle royale, live events, concerts, LEGO survival mode, racing spin-offs — it's become less of a game and more of a platform.</p>
      <p>But its latest evolution may be the most troubling yet: the quiet normalization of gambling mechanics inside one of the most kid-friendly ecosystems in gaming.</p>
      <h3>What's Actually Happening</h3>
      <p>Creator-made islands are introducing loot boxes and gambling-style microtransactions. This isn't just another monetization controversy — it's a warning sign.</p>
      <p>The line between a game and a gambling platform is getting blurrier by the month, and Fortnite's massive young audience makes this especially concerning.</p>
      <p>We break down exactly what's changed, why it matters, and what regulators might actually do about it — on this week's episode.</p>
    `
  }
];
