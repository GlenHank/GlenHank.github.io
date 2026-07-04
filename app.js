const postsUrl = "data/posts.json";

const seedPosts = [
  {
    id: "github-pages-blog-workflow",
    title: "A Lightweight GitHub Pages Blog Workflow",
    tag: "Site Notes",
    date: "2026-05-17",
    excerpt: "This site keeps posts in a small JSON file so the whole homepage stays fast, portable, and easy to edit on GitHub.",
    body:
      "The blog is intentionally simple. Posts live in `data/posts.json`, images can live in `assets/blog/`, and GitHub Pages publishes the result as a static site.\n\nThat means there is no database, no CMS login, and very little machinery to break. It also means writing is a deliberate act: edit the post file, commit, and publish.",
    image: "",
  },
  {
    id: "microstructure-as-map",
    title: "Microstructure as a Map, Not a Mystery",
    tag: "Microstructure",
    date: "2026-05-16",
    excerpt: "A short note on reading grains, phases, and interfaces as the city plan of a material.",
    body:
      "Microstructure is often introduced as something to observe, but I like treating it as something to navigate. Grain boundaries, phase contrast, pores, twins, and precipitates are all clues about what happened during processing and what might happen under service.",
    image: "",
  },
  {
    id: "processing-leaves-fingerprints",
    title: "Processing Leaves Fingerprints",
    tag: "Processing",
    date: "2026-05-12",
    excerpt: "Cooling rate, heat treatment, and fabrication route all leave evidence if you know where to look.",
    body:
      "A material remembers its processing history. The challenge is to connect that memory to measurable structure and useful performance. I want this site to become a place where those connections can be sketched clearly.",
    image: "",
  },
];

const elements = {
  canvas: document.querySelector("#ink-field"),
  featured: document.querySelector("#featured-post"),
  grid: document.querySelector("#post-grid"),
  dialog: document.querySelector("#post-dialog"),
  dialogClose: document.querySelector("#dialog-close"),
  dialogContent: document.querySelector("#dialog-content"),
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------- blog ---------- */

async function loadPosts() {
  try {
    const response = await fetch(postsUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Posts request failed: ${response.status}`);
    const data = await response.json();
    const posts = normalizePosts(data);
    renderPosts(posts.length ? posts : seedPosts);
  } catch {
    renderPosts(seedPosts);
  }
}

function normalizePosts(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.posts)) return data.posts;
  return [];
}

function renderPosts(posts) {
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const [latest, ...others] = sorted;
  if (!latest) return;

  elements.featured.replaceChildren(createFeaturedPost(latest));
  elements.grid.replaceChildren(...others.map(createPostCard));
}

function createFeaturedPost(post) {
  const button = document.createElement("button");
  button.type = "button";
  button.addEventListener("click", () => openPost(post));
  button.innerHTML = `
    <div class="featured-art" ${coverStyle(post)}></div>
    <div class="featured-text">
      <div class="post-meta"><span>${escapeHtml(post.tag)}</span><span>${formatDate(post.date)}</span></div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.excerpt)}</p>
    </div>
  `;
  return button;
}

function createPostCard(post) {
  const article = document.createElement("article");
  article.className = "post-card";
  article.innerHTML = `
    <button type="button">
      <div class="post-art" ${coverStyle(post)}></div>
      <div class="post-card-body">
        <div class="post-meta"><span>${escapeHtml(post.tag)}</span><span>${formatDate(post.date)}</span></div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.excerpt)}</p>
      </div>
    </button>
  `;
  article.querySelector("button").addEventListener("click", () => openPost(post));
  return article;
}

function coverStyle(post) {
  if (!post.image) return "";
  return `style="background-image: linear-gradient(rgba(10, 11, 10, 0.16), rgba(10, 11, 10, 0.16)), url('${escapeAttribute(post.image)}')"`;
}

function openPost(post) {
  elements.dialogContent.innerHTML = `
    <div class="dialog-cover" ${coverStyle(post)}></div>
    <div class="dialog-body">
      <div class="post-meta"><span>${escapeHtml(post.tag)}</span><span>${formatDate(post.date)}</span></div>
      <h2>${escapeHtml(post.title)}</h2>
      <div class="markdown-body">${renderMarkdown(post.body)}</div>
    </div>
  `;
  elements.dialog.showModal();
}

function renderMarkdown(value) {
  return escapeHtml(value)
    .split(/\n{2,}/)
    .map((block) => {
      const text = block.trim();
      if (!text) return "";
      if (text.startsWith("### ")) return `<h3>${formatInline(text.slice(4))}</h3>`;
      if (text.startsWith("## ")) return `<h3>${formatInline(text.slice(3))}</h3>`;
      if (text.startsWith("# ")) return `<h3>${formatInline(text.slice(2))}</h3>`;
      if (/^[-*] /m.test(text)) {
        const items = text
          .split("\n")
          .filter((line) => /^[-*] /.test(line))
          .map((line) => `<li>${formatInline(line.replace(/^[-*] /, ""))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      if (/^!\[[^\]]*]\([^)]+\)$/.test(text)) {
        return text.replace(/^!\[([^\]]*)]\(([^)]+)\)$/, '<img src="$2" alt="$1">');
      }
      return `<p>${formatInline(text).replaceAll("\n", "<br>")}</p>`;
    })
    .join("");
}

function formatInline(value) {
  return value
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

/* ---------- ink flow field ---------- */

const ink = {
  ctx: null,
  width: 0,
  height: 0,
  particles: [],
  blots: [],
  raf: 0,
  time: 0,
};

function flowAngle(x, y, t) {
  // layered sines approximate slow, drifting ink currents
  const s = 0.0016;
  return (
    Math.sin(x * s + t * 0.00016) * 1.4 +
    Math.cos(y * s * 1.3 - t * 0.00011) * 1.2 +
    Math.sin((x + y) * s * 0.6 + t * 0.00007) * 0.8
  );
}

function makeParticle(width, height, randomAge = true) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    age: randomAge ? Math.random() * 420 : 0,
    life: 280 + Math.random() * 320,
    speed: 0.22 + Math.random() * 0.4,
    width: 0.5 + Math.random() * 1.7,
    cinnabar: Math.random() < 0.045,
  };
}

function setupInkField() {
  const canvas = elements.canvas;
  const ctx = canvas.getContext("2d");
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  ink.ctx = ctx;
  ink.width = width;
  ink.height = height;

  const count = prefersReducedMotion.matches ? 0 : Math.min(110, Math.floor(width / 13));
  ink.particles = Array.from({ length: count }, () => makeParticle(width, height));
  ink.blots = [];
}

function drawInkFrame(now) {
  const { ctx, width, height } = ink;
  ink.time = now;

  // fade previous strokes while keeping the canvas transparent
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0, 0, 0, 0.018)";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";

  for (const p of ink.particles) {
    const angle = flowAngle(p.x, p.y, now);
    const nx = p.x + Math.cos(angle) * p.speed;
    const ny = p.y + Math.sin(angle) * p.speed;
    const fade = Math.sin((p.age / p.life) * Math.PI); // ease in and out

    ctx.strokeStyle = p.cinnabar
      ? `rgba(190, 66, 52, ${0.24 * fade})`
      : `rgba(214, 208, 194, ${0.12 * fade})`;
    ctx.lineWidth = p.width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(nx, ny);
    ctx.stroke();

    p.x = nx;
    p.y = ny;
    p.age += 1;

    const out = p.x < -30 || p.x > width + 30 || p.y < -30 || p.y > height + 30;
    if (p.age > p.life || out) {
      Object.assign(p, makeParticle(width, height, false));
    }
  }

  // soft expanding ink blots from pointer movement
  for (let i = ink.blots.length - 1; i >= 0; i -= 1) {
    const blot = ink.blots[i];
    blot.r += blot.growth;
    blot.alpha *= 0.955;
    if (blot.alpha < 0.004) {
      ink.blots.splice(i, 1);
      continue;
    }
    const gradient = ctx.createRadialGradient(blot.x, blot.y, 0, blot.x, blot.y, blot.r);
    gradient.addColorStop(0, `rgba(214, 208, 194, ${blot.alpha})`);
    gradient.addColorStop(1, "rgba(214, 208, 194, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(blot.x, blot.y, blot.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ink.raf = requestAnimationFrame(drawInkFrame);
}

function startInkField() {
  cancelAnimationFrame(ink.raf);
  setupInkField();
  if (!prefersReducedMotion.matches) {
    ink.raf = requestAnimationFrame(drawInkFrame);
  } else {
    ink.ctx.clearRect(0, 0, ink.width, ink.height);
  }
}

let lastBlot = 0;
window.addEventListener("pointermove", (event) => {
  if (prefersReducedMotion.matches) return;
  const now = performance.now();
  if (now - lastBlot < 90 || ink.blots.length > 14) return;
  lastBlot = now;
  ink.blots.push({
    x: event.clientX,
    y: event.clientY,
    r: 6,
    growth: 0.9 + Math.random() * 0.8,
    alpha: 0.085,
  });
});

let resizeTimer = 0;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(startInkField, 180);
});

prefersReducedMotion.addEventListener?.("change", startInkField);

/* ---------- scroll reveal ---------- */

function setupReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((el) => observer.observe(el));
}

/* ---------- init ---------- */

elements.dialogClose.addEventListener("click", () => elements.dialog.close());

loadPosts();
startInkField();
setupReveal();
