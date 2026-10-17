/* =====================================================================
 * learn-enhance.js —— 学习增强层（5 个 lesson 共用，零依赖）
 *
 * 由 5 个 lesson 的 index.html 以 <script type="module"> 引入。
 * 只做“附加”，不改动原站既有逻辑（lesson.js / i18n.js 保持原样）。
 *
 * 提供 8 项能力：
 *   1. 顶部阅读进度条
 *   2. 代码块一键复制
 *   3. 每节「本节知识结构图」（把小标题组织成两层树，先看骨架再读细节）
 *   4. 每节「本节速览」（自动汇总讲解区小标题）
 *   5. 每节「标记已掌握」+ 本章进度统计（localStorage 持久化）
 *   6. 节内 上一节 / 下一节 快捷跳转
 *   7. 左侧目录滚动高亮（滚动即知读到哪一节）
 *   8. 侧栏工具入口（图表速查 / 术语表 / 画廊 / 门户）+ 回到顶部
 * ===================================================================== */

const LU = {
  zh: {
    overview: "本节速览",
    overviewMeta: (n) => `${n} 个小标题`,
    mastery: "标记本节已掌握",
    mastered: "✓ 已掌握",
    lessonProgress: (a, b) => `本章已掌握 <b>${a}</b> / ${b} 节`,
    copy: "复制",
    copied: "已复制 ✓",
    prev: "← 上一节",
    next: "下一节 →",
    backtop: "回到顶部",
    tools: "学习工具",
    cheatsheet: "🧭 图表选型决策器",
    glossary: "📖 可视化术语表",
    gallery: "🖼 可视化画廊",
    portal: "🏠 课程门户",
    structure: "本节知识结构图",
    structExplain: "讲解",
    structCode: "代码",
    structMore: (n) => `+ ${n} 个小标题…`,
  },
  en: {
    overview: "Section Overview",
    overviewMeta: (n) => `${n} headings`,
    mastery: "Mark as mastered",
    mastered: "✓ Mastered",
    lessonProgress: (a, b) => `Mastered <b>${a}</b> / ${b} sections`,
    copy: "Copy",
    copied: "Copied ✓",
    prev: "← Prev",
    next: "Next →",
    backtop: "Back to top",
    tools: "Study Tools",
    cheatsheet: "🧭 Chart Selector",
    glossary: "📖 Glossary",
    gallery: "🖼 Viz Gallery",
    portal: "🏠 Course Portal",
    structure: "Section Knowledge Map",
    structExplain: "Explain",
    structCode: "Code",
    structMore: (n) => `+ ${n} more headings…`,
  },
};

const PROGRESS_KEY = "vis.learn.progress.v1";
let locale = "zh-CN";

/* 需要在语言切换后重绘的回调 */
const rerenderFns = [];

/* ---------------- 进度存储 ---------------- */
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}") || {};
  } catch (e) {
    return {};
  }
}
function saveProgress(p) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch (e) {
    /* 隐私模式下静默失败 */
  }
}

/* ---------------- 双语文本 ---------------- */
function readLocale() {
  try {
    const api = window.__i18n;
    if (api && typeof api.getLocale === "function") return api.getLocale();
    return (
      localStorage.getItem("wbl-locale") ||
      document.documentElement.lang ||
      "zh-CN"
    );
  } catch (e) {
    return "zh-CN";
  }
}
function T(key) {
  return (locale.startsWith("en") ? LU.en : LU.zh)[key];
}
const boundTexts = [];
function applyText(el, key, arg) {
  const v = T(key);
  if (typeof v !== "function") {
    el.textContent = v;
    return;
  }
  if (arg && typeof arg === "object") {
    const val = v(arg.a, arg.b ?? 0);
    if (arg.html) el.innerHTML = val;
    else el.textContent = val;
  } else {
    el.textContent = v(arg ?? 0);
  }
}
function bindText(el, key, arg) {
  boundTexts.push({ el, key, arg });
  applyText(el, key, arg);
}
function refreshTexts() {
  boundTexts.forEach((b) => applyText(b.el, b.key, b.arg));
}
function repaintAll() {
  locale = readLocale();
  refreshTexts();
  rerenderFns.forEach((f) => f());
}
function hookLocale() {
  const api = window.__i18n;
  if (!api || api.__leHooked) return;
  api.__leHooked = true;
  const orig = api.setLocale;
  api.setLocale = function () {
    const r = orig.apply(this, arguments);
    setTimeout(repaintAll, 0);
    return r;
  };
}

/* 双 DOM：只取当前语言的节点 */
function isVisibleLang(el) {
  const l = el.dataset && el.dataset.lang;
  return !l || l === locale;
}

/* ---------------- 1. 阅读进度条 ---------------- */
function initProgressBar() {
  const bar = document.createElement("div");
  bar.className = "le-progressbar";
  document.body.appendChild(bar);
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, p)) + "%";
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------------- 2. 代码块复制 ---------------- */
const wrappedCode = new WeakSet();
function wrapCodeBlocks(root) {
  (root || document).querySelectorAll("pre > code").forEach((code) => {
    const pre = code.parentNode;
    if (!pre || wrappedCode.has(pre)) return;
    wrappedCode.add(pre);
    const wrap = document.createElement("div");
    wrap.className = "le-code-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "le-copy-btn";
    bindText(btn, "copy");
    btn.addEventListener("click", async () => {
      const text = code.innerText;
      const copiedLabel = (locale.startsWith("en") ? LU.en : LU.zh).copied;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        btn.textContent = copiedLabel;
        setTimeout(() => applyText(btn, "copy"), 1200);
      } catch (e) {
        /* 忽略复制失败 */
      }
    });
    wrap.appendChild(btn);
  });
}

/* ---------------- 3+4+5+6. 每节增强 ---------------- */
function buildOverview(article) {
  const texts = buildOverviewList(article);
  if (!texts.length) return null;

  const box = document.createElement("details");
  box.className = "le-overview";
  const sum = document.createElement("summary");
  const sumLabel = document.createElement("span");
  bindText(sumLabel, "overview");
  const meta = document.createElement("span");
  meta.style.color = "#94a3b8";
  meta.style.fontWeight = "400";
  meta.style.marginLeft = "8px";
  bindText(meta, "overviewMeta", texts.length);
  sum.appendChild(sumLabel);
  sum.appendChild(meta);

  const ul = document.createElement("ul");
  ul.className = "le-overview-list";
  texts.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
  box.appendChild(sum);
  box.appendChild(ul);

  // 语言切换后重建列表（消解双 DOM 差异）
  rerenderFns.push(() => {
    const fresh = buildOverviewList(article);
    ul.innerHTML = "";
    fresh.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
    applyText(meta, "overviewMeta", fresh.length);
  });
  return box;
}

/* 取当前语言的可见 h3（过滤超长标题） */
function pickHeads(panel) {
  return Array.from(panel.querySelectorAll("h3"))
    .filter(isVisibleLang)
    .filter((h) => {
      const t = h.textContent.trim();
      return t && t.length <= 40;
    });
}

/* 每节的「讲解 / 代码」两组小标题元素 */
function collectHeadings(article) {
  const explainPanel =
    article.querySelector('.tab-panel[data-panel="explain"]') || article;
  const codePanel = article.querySelector('.tab-panel[data-panel="code"]');
  const explain = pickHeads(explainPanel);
  const code = codePanel ? pickHeads(codePanel) : [];
  return { explain, code };
}

function buildOverviewList(article) {
  return collectHeadings(article).explain.map((h) => h.textContent.trim());
}

/* ---------------- 3b. 本节知识结构图（由小标题自动派生） ---------------- */
function escXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/* 该 h3 之后、下一个标题之前的同级内容块数量（用于节点宽度编码） */
function headingWeight(h) {
  let n = 0;
  let sib = h.nextElementSibling;
  while (sib && !/^H[1-6]$/.test(sib.tagName)) {
    if (sib.matches("p, ul, ol, table, blockquote, pre")) n++;
    sib = sib.nextElementSibling;
  }
  return n;
}

function drawStructure(rootLabel, heads) {
  const groups = [];
  if (heads.explain.length) groups.push({ key: "structExplain", items: heads.explain });
  if (heads.code.length) groups.push({ key: "structCode", items: heads.code, strip: true });
  const W = 640;
  const pad = 16;
  const colW = (W - pad * (groups.length + 1)) / groups.length;
  const MAX = 8;
  const rowH = 24;
  const gap = 6;
  const topY = 8;
  const rootH = 26;
  const grpH = 22;

  let maxRows = 0;
  groups.forEach((g) => {
    maxRows = Math.max(maxRows, Math.min(g.items.length, MAX) + (g.items.length > MAX ? 1 : 0));
  });
  const H = topY + rootH + 18 + grpH + 8 + maxRows * (rowH + gap) + 6;

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  const rootW = Math.max(160, Math.min(460, 56 + rootLabel.length * 14));
  const rx = (W - rootW) / 2;
  svg += `<rect x="${rx}" y="${topY}" width="${rootW}" height="${rootH}" rx="6" fill="#1e1b4b"><title>${escXml(rootLabel)}</title></rect>`;
  svg += `<text x="${W / 2}" y="${topY + 17}" text-anchor="middle" font-size="12" font-weight="600" fill="#ffffff">${escXml(truncate(rootLabel, 26))}</text>`;
  const rootBottom = topY + rootH;
  const grpY = rootBottom + 18;

  groups.forEach((g, gi) => {
    const colX = pad + gi * (colW + pad);
    const cx = colX + colW / 2;
    svg += `<path d="M${W / 2} ${rootBottom} V${rootBottom + 9} H${cx} V${grpY}" fill="none" stroke="#cbd5e1" stroke-width="1.4"/>`;
    svg += `<rect x="${colX}" y="${grpY}" width="${colW}" height="${grpH}" rx="6" fill="#e0e7ff" stroke="#c7d2fe"/>`;
    svg += `<text x="${cx}" y="${grpY + 15}" text-anchor="middle" font-size="11" font-weight="600" fill="#4338ca">${escXml(T(g.key))}</text>`;

    let y = grpY + grpH + 8;
    g.items.slice(0, MAX).forEach((h) => {
      const raw = h.textContent.trim();
      const t = g.strip
        ? raw.replace(/^(关键代码|Key Code)\s*[①-⑩\d]*\s*/i, "") || raw
        : raw;
      const w = Math.max(90, Math.min(colW - 24, 100 + headingWeight(h) * 16));
      const lx = colX + 12;
      svg += `<path d="M${cx} ${grpY + grpH} V${y - 4} H${lx + w / 2}" fill="none" stroke="#cbd5e1" stroke-width="1.2"/>`;
      svg += `<rect x="${lx}" y="${y}" width="${w}" height="${rowH}" rx="5" fill="#ffffff" stroke="#6366f1"><title>${escXml(t)}</title></rect>`;
      svg += `<text x="${lx + w / 2}" y="${y + 16}" text-anchor="middle" font-size="10.5" fill="#3730a3">${escXml(truncate(t, 18))}</text>`;
      y += rowH + gap;
    });
    if (g.items.length > MAX) {
      svg += `<text x="${colX + 12}" y="${y + 10}" font-size="10.5" fill="#94a3b8">${escXml(T("structMore")(g.items.length - MAX))}</text>`;
    }
  });
  svg += "</svg>";
  return svg;
}

function buildStructure(article) {
  const { explain, code } = collectHeadings(article);
  if (!explain.length && !code.length) return null;
  const h2 = article.querySelector("h2");
  const rootLabel = h2 ? h2.textContent.trim() : "";

  const wrap = document.createElement("div");
  wrap.className = "le-struct";
  const cap = document.createElement("div");
  cap.className = "le-struct-cap";
  bindText(cap, "structure");
  wrap.appendChild(cap);
  const holder = document.createElement("div");
  holder.className = "le-struct-svg";
  wrap.appendChild(holder);

  const render = () => {
    holder.innerHTML = drawStructure(rootLabel, collectHeadings(article));
  };
  render();
  rerenderFns.push(render);
  return wrap;
}

function initSections() {
  const articles = Array.from(document.querySelectorAll(".chapter"));
  if (!articles.length) return;
  const navLinks = Array.from(
    document.querySelectorAll(".chapter-nav a[data-chapter]")
  );

  const head = document.querySelector(".lesson-header");
  let badge = null;
  if (head) {
    badge = document.createElement("span");
    badge.className = "le-lesson-progress";
    head.appendChild(badge);
  }
  const progress = loadProgress();

  const updateBadge = () => {
    if (!badge) return;
    const done = articles.filter((a) => progress[a.id]).length;
    applyText(badge, "lessonProgress", {
      a: done,
      b: articles.length,
      html: true,
    });
  };
  rerenderFns.push(updateBadge);
  updateBadge();

  articles.forEach((article, i) => {
    const subtitle = article.querySelector(".chapter-subtitle");
    const anchor = subtitle || article.querySelector("h2");

    /* --- 掌握按钮 --- */
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "le-mastery";
    const renderBtn = () => {
      const done = !!progress[article.id];
      btn.classList.toggle("le-done", done);
      btn.textContent = done ? T("mastered") : T("mastery");
    };
    btn.addEventListener("click", () => {
      if (progress[article.id]) delete progress[article.id];
      else progress[article.id] = true;
      saveProgress(progress);
      renderBtn();
      updateBadge();
    });
    renderBtn();
    rerenderFns.push(renderBtn);

    /* --- 增强条容器 --- */
    const bar = document.createElement("div");
    bar.className = "le-coursebar";
    const headRow = document.createElement("div");
    headRow.className = "le-coursebar-head";
    headRow.appendChild(btn);
    bar.appendChild(headRow);
    const structure = buildStructure(article);
    if (structure) bar.appendChild(structure);
    const overview = buildOverview(article);
    if (overview) bar.appendChild(overview);
    if (anchor) anchor.insertAdjacentElement("afterend", bar);
    else article.insertBefore(bar, article.firstChild);

    /* --- 节内翻页 --- */
    const nav = document.createElement("nav");
    nav.className = "le-sectionnav";
    const prevArt = articles[i - 1];
    const nextArt = articles[i + 1];
    if (prevArt) {
      const a = document.createElement("a");
      a.href = "#" + prevArt.id;
      a.dataset.leDir = "prev";
      a.dataset.leTitle = prevArt.querySelector("h2").textContent.trim();
      nav.appendChild(a);
    } else {
      const s = document.createElement("span");
      s.className = "le-disabled";
      nav.appendChild(s);
    }
    if (nextArt) {
      const a = document.createElement("a");
      a.href = "#" + nextArt.id;
      a.dataset.leDir = "next";
      a.dataset.leTitle = nextArt.querySelector("h2").textContent.trim();
      nav.appendChild(a);
    } else {
      const a = document.createElement("a");
      a.href = "../";
      nav.appendChild(a);
    }
    // 翻页文本需带小节标题，单独重绘
    const paintNav = () => {
      nav.querySelectorAll("a[data-le-dir]").forEach((a) => {
        const dir = a.dataset.leDir === "prev" ? T("prev") : T("next");
        a.textContent =
          a.dataset.leDir === "prev"
            ? `${dir} · ${a.dataset.leTitle}`
            : `${a.dataset.leTitle} · ${dir}`;
      });
      const dis = nav.querySelector(".le-disabled");
      if (dis) dis.textContent = T("prev");
      const portalNext = nav.querySelector('a[href="../"]');
      if (portalNext) portalNext.textContent = `${T("portal")} ${T("next")}`;
    };
    paintNav();
    rerenderFns.push(paintNav);
    article.appendChild(nav);
  });

  /* --- 6. 滚动高亮 --- */
  let ticking = false;
  const updateCurrent = () => {
    let cur = articles[0];
    for (const a of articles) {
      if (a.getBoundingClientRect().top <= 140) cur = a;
    }
    navLinks.forEach((l) =>
      l.classList.toggle("le-current", l.dataset.chapter === cur.id)
    );
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateCurrent);
      }
    },
    { passive: true }
  );
  updateCurrent();
}

/* ---------------- 7. 侧栏工具 + 回到顶部 ---------------- */
function initTools() {
  const tip = document.querySelector(".chapter-nav .nav-tip");
  if (tip) {
    const box = document.createElement("div");
    box.className = "le-tools";
    const title = document.createElement("div");
    title.className = "le-tools-title";
    bindText(title, "tools");
    box.appendChild(title);
    [
      ["cheatsheet", "../cheatsheet.html"],
      ["glossary", "../glossary.html"],
      ["gallery", "../gallery.html"],
      ["portal", "../"],
    ].forEach(([key, href]) => {
      const a = document.createElement("a");
      a.href = href;
      bindText(a, key);
      box.appendChild(a);
    });
    tip.appendChild(box);
  }

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "le-backtop";
  btn.textContent = "↑";
  bindTextArrow(btn);
  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
  document.body.appendChild(btn);
  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("le-show", window.scrollY > 480),
    { passive: true }
  );
}
function bindTextArrow(btn) {
  const paint = () => {
    btn.title = T("backtop");
    btn.setAttribute("aria-label", T("backtop"));
  };
  paint();
  rerenderFns.push(paint);
}

/* ---------------- demo 动态注入的代码块 ---------------- */
function watchMutations() {
  const mo = new MutationObserver((records) => {
    if (records.some((r) => r.addedNodes && r.addedNodes.length)) {
      wrapCodeBlocks(document);
    }
  });
  document
    .querySelectorAll(".demo-mount, [id^='demo-mount-']")
    .forEach((m) => mo.observe(m, { childList: true, subtree: true }));
}

/* ---------------- 启动 ---------------- */
function main() {
  locale = readLocale();
  initProgressBar();
  initTools();
  initSections();
  wrapCodeBlocks(document);
  watchMutations();
  hookLocale();
  repaintAll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
