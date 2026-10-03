const postsUrl = "data/posts.json";
const seedPosts = [
  {
    id: "github-pages-blog-workflow",
    title: "A Lightweight GitHub Pages Blog Workflow",
    tag: "Site Notes",
    date: "2026-05-17",
    excerpt:
      "This site keeps posts in a small JSON file so the whole homepage stays fast, portable, and easy to edit on GitHub.",
    body: "The blog is intentionally simple. Posts live in `data/posts.json`, images can live in `assets/blog/`, and GitHub Pages publishes the result as a static site.\n\nThat means there is no database, no CMS login, and very little machinery to break. It also means writing is a deliberate act: edit the post file, commit, and publish.",
    image: "",
  },
  {
    id: "microstructure-as-map",
    title: "Microstructure as a Map, Not a Mystery",
    tag: "Microstructure",
    date: "2026-05-16",
    excerpt:
      "A short note on reading grains, phases, and interfaces as the city plan of a material.",
    body: "Microstructure is often introduced as something to observe, but I like treating it as something to navigate. Grain boundaries, phase contrast, pores, twins, and precipitates are all clues about what happened during processing and what might happen under service.",
    image: "",
  },
  {
    id: "processing-leaves-fingerprints",
    title: "Processing Leaves Fingerprints",
    tag: "Processing",
    date: "2026-05-12",
    excerpt:
      "Cooling rate, heat treatment, and fabrication route all leave evidence if you know where to look.",
    body: "A material remembers its processing history. The challenge is to connect that memory to measurable structure and useful performance. I want this site to become a place where those connections can be sketched clearly.",
    image: "",
  },
];
const elements = {
  featured: document.querySelector("#featured-post"),
  grid: document.querySelector("#post-grid"),
  dialog: document.querySelector("#post-dialog"),
  dialogClose: document.querySelector("#dialog-close"),
  dialogContent: document.querySelector("#dialog-content"),
  hero: document.querySelector(".hero"),
  research: document.querySelector("#research"),
  canvas: document.querySelector("#material-canvas"),
  header: document.querySelector(".site-header"),
  motion: document.querySelector("#motion-toggle"),
};
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (a, b, t) => a + (b - a) * t;
let userPaused = false;
let motionEnabled = !reducedMotion.matches;
let scrollFrame = 0;
let sceneFrame = 0;
let researchProgress = 0;
let activeChapter = -1;
let sceneVisible = false;
let lastSceneFrame = 0;
let sceneTime = 0;
let canvasWidth = 0;
let canvasHeight = 0;
let pointer = { x: 0, y: 0 };
const ctx = elements.canvas.getContext("2d");

function icons() {
  window.lucide?.createIcons();
}
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function safeUrl(value) {
  try {
    const url = new URL(value, location.href);
    return ["https:", "http:", "mailto:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}
function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}
function coverStyle(post) {
  const url = post.image && safeUrl(post.image);
  return url
    ? `style="background-image:url(&quot;${escapeHtml(url)}&quot;)"`
    : "";
}
async function loadPosts() {
  try {
    const response = await fetch(postsUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Posts unavailable");
    const data = await response.json();
    const posts = Array.isArray(data) ? data : data.posts;
    renderPosts(Array.isArray(posts) && posts.length ? posts : seedPosts);
  } catch {
    renderPosts(seedPosts);
  }
}
function renderPosts(posts) {
  const [latest, ...others] = [...posts].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  const meta = (post) =>
    `<div class="post-meta"><span>${escapeHtml(post.tag)}</span><span>${formatDate(post.date)}</span></div>`;
  const read =
    '<span class="post-read">Read the note <i data-lucide="arrow-up-right" aria-hidden="true"></i></span>';
  const featured = document.createElement("button");
  featured.type = "button";
  featured.innerHTML = `<div class="featured-art" ${coverStyle(latest)} aria-hidden="true"><span class="art-caption">Field notes.</span></div><div class="featured-text">${meta(latest)}<h3>${escapeHtml(latest.title)}</h3><p>${escapeHtml(latest.excerpt)}</p>${read}</div>`;
  featured.addEventListener("click", () => openPost(latest));
  elements.featured.replaceChildren(featured);
  elements.grid.replaceChildren(
    ...others.map((post) => {
      const article = document.createElement("article");
      article.className = "post-card reveal";
      article.innerHTML = `<button type="button"><div class="post-art" ${coverStyle(post)} aria-hidden="true"></div><div class="post-card-body">${meta(post)}<h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt)}</p>${read}</div></button>`;
      article
        .querySelector("button")
        .addEventListener("click", () => openPost(post));
      const art = article.querySelector(".post-art");
      article.addEventListener("pointermove", (event) => {
        if (!motionEnabled || !finePointer.matches) return;
        const rect = article.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        art.style.transform = `perspective(800px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-3px)`;
      });
      article.addEventListener("pointerleave", () => {
        art.style.transform = "";
      });
      return article;
    }),
  );
  icons();
  observeReveals();
  scheduleScroll();
}
function openPost(post) {
  elements.dialogContent.innerHTML = `<div class="dialog-cover" ${coverStyle(post)}></div><div class="dialog-body"><div class="post-meta"><span>${escapeHtml(post.tag)}</span><span>${formatDate(post.date)}</span></div><h2 id="article-title">${escapeHtml(post.title)}</h2><div class="markdown-body">${renderMarkdown(post.body)}</div></div>`;
  elements.dialog.setAttribute("aria-labelledby", "article-title");
  elements.dialog.showModal();
  elements.dialog.scrollTop = 0;
  document.body.classList.add("dialog-open");
}
// Keep the existing small, escaped Markdown subset used by the notes file.
function renderMarkdown(value) {
  return escapeHtml(value)
    .split(/\n{2,}/)
    .map((block) => {
      const text = block.trim();
      if (!text) return "";
      if (/^#{1,3} /.test(text))
        return `<h3>${formatInline(text.replace(/^#{1,3} /, ""))}</h3>`;
      if (/^[-*] /m.test(text))
        return `<ul>${text
          .split("\n")
          .filter((line) => /^[-*] /.test(line))
          .map((line) => `<li>${formatInline(line.replace(/^[-*] /, ""))}</li>`)
          .join("")}</ul>`;
      const image = text.match(/^!\[([^\]]*)]\(([^)]+)\)$/);
      if (image) {
        const url = safeUrl(decodeEntities(image[2]));
        return url
          ? `<img src="${escapeHtml(url)}" alt="${image[1]}" loading="lazy">`
          : `<p>${text}</p>`;
      }
      return `<p>${formatInline(text).replaceAll("\n", "<br>")}</p>`;
    })
    .join("");
}
function decodeEntities(value) {
  const area = document.createElement("textarea");
  area.innerHTML = value;
  return area.value;
}
function formatInline(value) {
  return value
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_, label, href) => {
      const url = safeUrl(decodeEntities(href));
      return url
        ? `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${label}</a>`
        : label;
    });
}
elements.dialogClose.addEventListener("click", () => elements.dialog.close());
elements.dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  scheduleScroll();
});
elements.dialog.addEventListener("click", (event) => {
  const rect = elements.dialog.getBoundingClientRect();
  if (
    event.target === elements.dialog &&
    (event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom)
  )
    elements.dialog.close();
});

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 },
      )
    : null;
function observeReveals() {
  document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
    if (!motionEnabled || !revealObserver) el.classList.add("visible");
    else revealObserver.observe(el);
  });
}

function setChapter(index) {
  if (index === activeChapter) return;
  activeChapter = index;
  document
    .querySelectorAll(".chapter")
    .forEach((chapter, i) => chapter.classList.toggle("active", i === index));
  document
    .querySelectorAll("[data-go-chapter]")
    .forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
  document.querySelector(".research-index").textContent = `0${index + 1} / 03`;
}
function updateScroll() {
  scrollFrame = 0;
  const y = window.scrollY;
  const height = window.innerHeight;
  const maxScroll = document.documentElement.scrollHeight - height;
  document.documentElement.style.setProperty(
    "--page-progress",
    maxScroll > 0 ? y / maxScroll : 0,
  );
  document.documentElement.style.setProperty(
    "--hero-progress",
    motionEnabled ? clamp(y / elements.hero.offsetHeight) : 0,
  );
  elements.header.classList.toggle("scrolled", y > 45);
  const rect = elements.research.getBoundingClientRect();
  researchProgress = motionEnabled
    ? clamp(-rect.top / Math.max(1, rect.height - height))
    : 0;
  setChapter(Math.min(2, Math.floor(researchProgress * 3)));
  elements.research.style.setProperty("--research-progress", researchProgress);
  const colors = [
    [223, 232, 223],
    [220, 231, 237],
    [232, 218, 220],
  ];
  const position = researchProgress * 2;
  const a = Math.min(1, Math.floor(position));
  const t = position - a;
  elements.research.style.setProperty(
    "--chapter-bg",
    `rgb(${colors[a].map((c, i) => Math.round(mix(c, colors[a + 1][i], t))).join(",")})`,
  );
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    const r = section.getBoundingClientRect();
    if (r.top <= height * 0.4 && r.bottom > height * 0.4)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  if (!motionEnabled) drawScene(0);
}
function scheduleScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}
window.addEventListener("scroll", scheduleScroll, { passive: true });
document.querySelectorAll("[data-go-chapter]").forEach((button) =>
  button.addEventListener("click", () => {
    const index = Number(button.dataset.goChapter);
    const travel = Math.max(
      0,
      elements.research.offsetHeight - window.innerHeight,
    );
    const top = elements.research.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + (travel * (index + 0.45)) / 3,
      behavior: motionEnabled ? "smooth" : "instant",
    });
  }),
);

// A deterministic triangular field morphs between three conceptual landscapes.
// Every frame is redrawn, and the animation loop runs only while the scene is visible.
function resizeCanvas() {
  const rect = elements.canvas.getBoundingClientRect();
  canvasWidth = rect.width;
  canvasHeight = rect.height;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  elements.canvas.width = Math.round(canvasWidth * dpr);
  elements.canvas.height = Math.round(canvasHeight * dpr);
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawScene(sceneTime);
}
function landscapePoint(col, row, phase, time) {
  const u = col / 11,
    v = row / 9;
  const jitter = Math.sin(col * 127.1 + row * 311.7);
  const jitter2 = Math.cos(col * 269.5 + row * 183.3);
  const drift = Math.sin(time * 0.00022 + col * 0.65 + row * 0.3);
  const base = {
    x: u + jitter * 0.024,
    y: v + jitter2 * 0.034 + drift * 0.008,
  };
  const boundary = Math.sin(u * Math.PI * 2 + time * 0.00014) * 0.04;
  const interfacePoint = {
    x: u + jitter * 0.01,
    y: v + boundary * Math.sin(v * Math.PI) + (v > 0.5 ? 0.026 : -0.026),
  };
  const wave = {
    x: u + Math.sin(v * 4 + time * 0.00018) * 0.04,
    y: v + Math.sin(u * 5 + v * 2 + time * 0.0003) * 0.08,
  };
  const segment = Math.min(1, Math.floor(phase));
  const f = phase - segment;
  const start = segment === 0 ? base : interfacePoint;
  const end = segment === 0 ? interfacePoint : wave;
  let x = mix(start.x, end.x, f),
    yy = mix(start.y, end.y, f);
  const px = u - 0.5 - pointer.x * 0.35,
    py = v - 0.5 - pointer.y * 0.35;
  const influence = Math.max(0, 1 - Math.hypot(px, py) * 2.5);
  x += pointer.x * influence * 0.035;
  yy += pointer.y * influence * 0.035;
  return {
    x: canvasWidth * (0.09 + x * 0.82),
    y: canvasHeight * (0.1 + yy * 0.78),
  };
}
function drawScene(time) {
  if (!ctx || !canvasWidth) return;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  const phase = motionEnabled ? researchProgress * 2 : 0;
  const points = Array.from({ length: 10 }, (_, row) =>
    Array.from({ length: 12 }, (_, col) =>
      landscapePoint(col, row, phase, time),
    ),
  );
  const palette = [
    [144, 169, 149],
    [141, 170, 185],
    [181, 148, 156],
  ];
  const start = Math.min(1, Math.floor(phase));
  const f = phase - start;
  const color = palette[start].map((c, i) =>
    Math.round(mix(c, palette[start + 1][i], f)),
  );
  const contours = clamp(phase - 1);
  const seam = Math.sin(clamp(phase / 2) * Math.PI);
  ctx.lineWidth = 0.6;
  for (let row = 0; row < 9; row++)
    for (let col = 0; col < 11; col++) {
      const a = points[row][col],
        b = points[row][col + 1],
        c = points[row + 1][col],
        d = points[row + 1][col + 1];
      [
        [a, b, c],
        [b, d, c],
      ].forEach((triangle, i) => {
        const shade = (Math.sin(row * 12.8 + col * 7.3 + i * 5) + 1) / 2;
        const alpha = (0.12 + shade * 0.43) * (1 - contours * 0.88);
        ctx.beginPath();
        triangle.forEach((p, j) =>
          j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
        );
        ctx.closePath();
        ctx.fillStyle = `rgba(${color.join(",")},${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(66,89,77,${(0.14 + shade * 0.15) * (1 - contours * 0.8)})`;
        ctx.stroke();
      });
    }
  if (seam > 0) {
    ctx.beginPath();
    points[5].forEach((point, i) =>
      i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y),
    );
    ctx.strokeStyle = `rgba(79,106,122,${seam * 0.75})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  if (contours > 0) {
    for (let row = 0; row < 22; row++) {
      ctx.beginPath();
      for (let step = 0; step <= 80; step++) {
        const u = step / 80;
        const v = row / 21;
        const wave = Math.sin(u * 5 + v * 2 + time * 0.0003);
        const x = canvasWidth * (0.09 + u * 0.82);
        const y = canvasHeight * (0.12 + v * 0.72 + wave * 0.07);
        step ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = `rgba(${color.join(",")},${contours * (0.3 + row / 45)})`;
      ctx.lineWidth = row % 5 === 0 ? 2 : 0.9;
      ctx.stroke();
    }
  }
  ctx.fillStyle = `rgba(55,79,66,${0.6 * (1 - contours)})`;
  points.forEach((row, r) =>
    row.forEach((point, c) => {
      if ((r + c) % 3 === 0) ctx.fillRect(point.x - 1, point.y - 1, 2, 2);
    }),
  );
}
function animateScene(now) {
  sceneFrame = 0;
  if (!motionEnabled || !sceneVisible || document.hidden) return;
  if (now - lastSceneFrame > 32) {
    sceneTime += Math.min(50, now - lastSceneFrame);
    lastSceneFrame = now;
    drawScene(sceneTime);
  }
  sceneFrame = requestAnimationFrame(animateScene);
}
function startScene() {
  if (motionEnabled && sceneVisible && !document.hidden && !sceneFrame) {
    lastSceneFrame = performance.now();
    sceneFrame = requestAnimationFrame(animateScene);
  }
}
if ("IntersectionObserver" in window) {
  new IntersectionObserver(
    (entries) => {
      sceneVisible = entries[0].isIntersecting;
      if (sceneVisible) startScene();
      else {
        cancelAnimationFrame(sceneFrame);
        sceneFrame = 0;
      }
    },
    { threshold: 0 },
  ).observe(elements.canvas);
} else {
  sceneVisible = true;
  startScene();
}
elements.canvas.addEventListener("pointermove", (event) => {
  if (!motionEnabled || !finePointer.matches) return;
  const rect = elements.canvas.getBoundingClientRect();
  pointer = {
    x: (event.clientX - rect.left) / rect.width - 0.5,
    y: (event.clientY - rect.top) / rect.height - 0.5,
  };
});
elements.canvas.addEventListener("pointerleave", () => {
  pointer = { x: 0, y: 0 };
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(sceneFrame);
    sceneFrame = 0;
  } else {
    startScene();
    scheduleScroll();
  }
});
let lastRipple = 0;
elements.hero.addEventListener("pointermove", (event) => {
  if (
    !motionEnabled ||
    !finePointer.matches ||
    event.target.closest("a,button")
  )
    return;
  const now = performance.now();
  const layer = document.querySelector(".hero-ripples");
  if (now - lastRipple < 180 || layer.childElementCount >= 12) return;
  lastRipple = now;
  const rect = elements.hero.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "water-ripple";
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  layer.append(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), {
    once: true,
  });
  window.setTimeout(() => ripple.remove(), 3000);
});
document.querySelectorAll(".swatch[data-palette]").forEach((button) =>
  button.addEventListener("click", () => {
    document.body.dataset.palette = button.dataset.palette;
    document
      .querySelectorAll(".swatch[data-palette]")
      .forEach((swatch) =>
        swatch.setAttribute("aria-pressed", String(swatch === button)),
      );
  }),
);
function applyMotion() {
  motionEnabled = !userPaused && !reducedMotion.matches;
  document.body.classList.toggle("motion-off", !motionEnabled);
  document.body.classList.toggle("js-motion", motionEnabled);
  elements.motion.setAttribute("aria-pressed", String(!motionEnabled));
  const label = motionEnabled
    ? "Pause motion"
    : reducedMotion.matches
      ? "Reduced motion is enabled in system settings"
      : "Resume motion";
  elements.motion.setAttribute("aria-label", label);
  elements.motion.title = label;
  elements.motion.disabled = reducedMotion.matches;
  elements.motion.innerHTML = `<i data-lucide="${motionEnabled ? "pause" : "play"}" aria-hidden="true"></i>`;
  icons();
  observeReveals();
  document.querySelector(".hero-ripples").replaceChildren();
  document.querySelectorAll(".post-art").forEach((art) => {
    art.style.transform = "";
  });
  if (!motionEnabled) {
    cancelAnimationFrame(sceneFrame);
    sceneFrame = 0;
    pointer = { x: 0, y: 0 };
  }
  resizeCanvas();
  scheduleScroll();
  startScene();
}
elements.motion.addEventListener("click", () => {
  userPaused = !userPaused;
  applyMotion();
});
reducedMotion.addEventListener("change", applyMotion);
const menu = document.querySelector("#menu-toggle"),
  nav = document.querySelector("#navigation");
function closeMenu() {
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Open navigation");
}
menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) {
    closeMenu();
    menu.focus();
  }
});
new ResizeObserver(() => {
  resizeCanvas();
  scheduleScroll();
}).observe(elements.canvas);
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu();
  scheduleScroll();
});
applyMotion();
loadPosts();
