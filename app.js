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
  canvas: document.querySelector("#material-field"),
  featured: document.querySelector("#featured-post"),
  grid: document.querySelector("#post-grid"),
  dialog: document.querySelector("#post-dialog"),
  dialogClose: document.querySelector("#dialog-close"),
  dialogContent: document.querySelector("#dialog-content"),
};

let materialAnimation;

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
  return `style="background-image: linear-gradient(rgba(7, 9, 13, 0.08), rgba(7, 9, 13, 0.08)), url('${escapeAttribute(post.image)}')"`;
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

function drawMaterialField() {
  if (materialAnimation) cancelAnimationFrame(materialAnimation);

  const canvas = elements.canvas;
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(ratio, ratio);

  const nodes = Array.from({ length: Math.min(72, Math.floor(width / 20)) }, (_, index) => ({
    x: (index * 97) % width,
    y: (index * 53) % height,
    r: 1.2 + (index % 4) * 0.7,
    vx: -0.12 + (index % 5) * 0.045,
    vy: -0.08 + (index % 7) * 0.026,
  }));

  function frame() {
    ctx.clearRect(0, 0, width, height);
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < -24) node.x = width + 24;
      if (node.x > width + 24) node.x = -24;
      if (node.y < -24) node.y = height + 24;
      if (node.y > height + 24) node.y = -24;
    });

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 118) {
          ctx.strokeStyle = `rgba(47, 125, 78, ${0.16 * (1 - distance / 118)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((node, index) => {
      ctx.fillStyle = index % 6 === 0 ? "rgba(214, 166, 66, 0.46)" : "rgba(47, 125, 78, 0.38)";
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    });

    materialAnimation = requestAnimationFrame(frame);
  }

  frame();
}

elements.dialogClose.addEventListener("click", () => elements.dialog.close());
window.addEventListener("resize", drawMaterialField);

loadPosts();
drawMaterialField();
