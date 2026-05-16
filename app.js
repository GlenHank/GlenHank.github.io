const postsKey = "qichao-hao-posts";
const postsUrl = "data/posts.json";

const seedPosts = [
  {
    id: "microstructure-as-map",
    title: "Microstructure as a Map, Not a Mystery",
    tag: "Microstructure",
    date: "2026-05-16",
    excerpt: "A short note on reading grains, phases, and interfaces as the city plan of a material.",
    body:
      "Microstructure is often introduced as something to observe, but I like treating it as something to navigate. Grain boundaries, phase contrast, pores, twins, and precipitates are all clues about what happened during processing and what might happen under service.\n\nThis blog section is ready for longer research notes, images from experiments, conference reflections, and polished explainers.",
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
  {
    id: "why-i-like-research-visuals",
    title: "Why I Like Research Visuals",
    tag: "Research Notes",
    date: "2026-05-08",
    excerpt: "Good figures can turn a difficult materials question into something people can reason about together.",
    body:
      "A good research visual is not decoration. It is a thinking tool. It lets people compare, argue, remember, and improve an idea. That is the spirit of this homepage: technically serious, but visually alive.",
    image: "",
  },
];

const elements = {
  canvas: document.querySelector("#crystal-field"),
  sound: document.querySelector("#sound-toggle"),
  featured: document.querySelector("#featured-post"),
  grid: document.querySelector("#post-grid"),
  editor: document.querySelector("#post-editor"),
  newPost: document.querySelector("#new-post-button"),
  closeEditor: document.querySelector("#close-editor"),
  exportPosts: document.querySelector("#export-posts"),
  title: document.querySelector("#post-title"),
  tag: document.querySelector("#post-tag"),
  image: document.querySelector("#post-image"),
  body: document.querySelector("#post-body"),
  dialog: document.querySelector("#post-dialog"),
  dialogClose: document.querySelector("#dialog-close"),
  dialogContent: document.querySelector("#dialog-content"),
};

let posts = seedPosts;
let publishedPostIds = new Set(seedPosts.map((post) => post.id));
let audioContext;
let audioNodes;
let crystalAnimation;

async function loadPublishedPosts() {
  try {
    const response = await fetch(postsUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Posts request failed: ${response.status}`);
    const data = await response.json();
    const published = normalizePosts(data);
    if (published.length) {
      publishedPostIds = new Set(published.map((post) => post.id));
      posts = mergePosts(published, loadLocalPosts());
      renderPosts();
      return;
    }
  } catch {
    posts = mergePosts(seedPosts, loadLocalPosts());
    renderPosts();
  }
}

function loadLocalPosts() {
  try {
    const saved = JSON.parse(localStorage.getItem(postsKey));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function savePosts() {
  const localOnly = posts.filter((post) => !publishedPostIds.has(post.id));
  localStorage.setItem(postsKey, JSON.stringify(localOnly));
}

function mergePosts(published, local) {
  const seen = new Set();
  return [...local, ...published].filter((post) => {
    if (!post || !post.id || seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  });
}

function normalizePosts(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.posts)) return data.posts;
  return [];
}

function renderPosts() {
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const [latest, ...others] = sorted;
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
  return `style="background-image: linear-gradient(rgba(10, 16, 34, 0.08), rgba(10, 16, 34, 0.08)), url('${post.image}')"`;
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
  const blocks = escapeHtml(value).split(/\n{2,}/);
  return blocks
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
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createId(title) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
}

function readImage(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.readAsDataURL(file);
  });
}

async function publishPost(event) {
  event.preventDefault();
  const title = elements.title.value.trim();
  const body = elements.body.value.trim();
  if (!title || !body) return;

  const image = await readImage(elements.image.files[0]);
  const post = {
    id: createId(title),
    title,
    tag: elements.tag.value.trim() || "Research Notes",
    date: new Date().toISOString().slice(0, 10),
    excerpt: body.split(/\s+/).slice(0, 24).join(" ") + (body.split(/\s+/).length > 24 ? "..." : ""),
    body,
    image,
  };

  posts = [post, ...posts].slice(0, 30);
  savePosts();
  renderPosts();
  elements.editor.reset();
  elements.editor.hidden = true;
}

function exportPosts() {
  const blob = new Blob([JSON.stringify({ posts }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "qichao-hao-blog-posts.json";
  link.click();
  URL.revokeObjectURL(url);
}

function toggleSound() {
  if (audioContext && audioContext.state !== "closed") {
    audioNodes.forEach((node) => node.stop?.());
    audioContext.close();
    audioContext = undefined;
    elements.sound.setAttribute("aria-pressed", "false");
    return;
  }

  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;

  audioContext = new AudioEngine();
  const master = audioContext.createGain();
  master.gain.value = 0.045;
  master.connect(audioContext.destination);

  const notes = [196, 247, 294];
  audioNodes = notes.map((frequency, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = index === 1 ? "triangle" : "sine";
    osc.frequency.value = frequency;
    gain.gain.value = 0.18 / notes.length;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    return osc;
  });

  elements.sound.setAttribute("aria-pressed", "true");
}

function drawCrystalField() {
  if (crystalAnimation) {
    cancelAnimationFrame(crystalAnimation);
  }

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

  const points = Array.from({ length: Math.min(80, Math.floor(width / 18)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 1.4 + Math.random() * 2.8,
    vx: -0.16 + Math.random() * 0.32,
    vy: -0.12 + Math.random() * 0.24,
  }));

  function frame() {
    ctx.clearRect(0, 0, width, height);
    points.forEach((point) => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < -20) point.x = width + 20;
      if (point.x > width + 20) point.x = -20;
      if (point.y < -20) point.y = height + 20;
      if (point.y > height + 20) point.y = -20;
    });

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 140) {
          ctx.strokeStyle = `rgba(98, 229, 255, ${0.16 * (1 - distance / 140)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    points.forEach((point, index) => {
      ctx.fillStyle = index % 5 === 0 ? "rgba(255, 209, 102, 0.72)" : "rgba(124, 247, 181, 0.62)";
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fill();
    });
    crystalAnimation = requestAnimationFrame(frame);
  }

  frame();
}

elements.newPost.addEventListener("click", () => {
  elements.editor.hidden = !elements.editor.hidden;
  if (!elements.editor.hidden) elements.title.focus();
});
elements.closeEditor.addEventListener("click", () => {
  elements.editor.hidden = true;
});
elements.editor.addEventListener("submit", publishPost);
elements.exportPosts.addEventListener("click", exportPosts);
elements.dialogClose.addEventListener("click", () => elements.dialog.close());
elements.sound.addEventListener("click", toggleSound);
window.addEventListener("resize", drawCrystalField);

renderPosts();
loadPublishedPosts();
drawCrystalField();
