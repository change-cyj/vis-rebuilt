/* =====================================================================
 * portal.js —— 门户增强逻辑（零依赖，D3 通过 CDN 动态加载）
 *   1. 学习路径 roadmap（D3）
 *   2. 概念地图 concept map（D3 force-directed）
 *   3. 学习进度总览（读 localStorage，与 learn-enhance.js 共用同一份数据）
 *   4. 全局搜索（索引自 concepts.js）
 * ===================================================================== */

import { CHAPTERS, CONCEPTS, LINKS } from "./concepts.js";

const PROGRESS_KEY = "vis.learn.progress.v1";
const colorOf = (ch) => (CHAPTERS.find((c) => c.no === ch) || {}).color || "#64748b";
const lessonOf = (ch) => "lesson-0" + ch + "/";

/* ---------------- 进度读取 ---------------- */
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}") || {};
  } catch (e) {
    return {};
  }
}
function chapterCounts() {
  const p = loadProgress();
  return CHAPTERS.map((c) => {
    const ids = CONCEPTS.filter((n) => n.ch === c.no);
    return { ch: c.no, done: ids.filter((n) => p[n.id]).length, total: ids.length };
  });
}

/* ---------------- D3 动态加载 ---------------- */
let d3 = null;
try {
  d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");
} catch (e) {
  console.warn("[portal] D3 加载失败，图形将降级为静态列表：", e);
}

function fallback(container, text) {
  if (container) container.innerHTML = `<p class="search-empty">${text}</p>`;
}

/* =====================================================================
 * 1. 学习路径 roadmap
 * ===================================================================== */
function renderRoadmap() {
  const host = document.getElementById("roadmap");
  if (!host) return;
  if (!d3) return fallback(host, "（D3 未加载，学习中请用下方章节卡片）");

  const W = 1080;
  const H = 250;
  const padX = 70;
  const cardW = 168;
  const cardH = 108;
  const step = (W - padX * 2 - cardW) / (CHAPTERS.length - 1);
  const y = 108;

  const svg = d3
    .select(host)
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("role", "img")
    .attr("aria-label", "五章学习路径示意");

  // 难度递增轴
  svg
    .append("text")
    .attr("x", padX)
    .attr("y", 26)
    .attr("font-size", 12)
    .attr("fill", "#94a3b8")
    .text("难度递增 →");

  const defs = svg.append("defs");
  defs
    .append("marker")
    .attr("id", "rmap-arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerWidth", 7)
    .attr("markerHeight", 7)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 z")
    .attr("fill", "#cbd5e1");

  CHAPTERS.forEach((c, i) => {
    const x = padX + i * step;
    const cx = x + cardW / 2;

    // 连线
    if (i > 0) {
      const prevX = padX + (i - 1) * step + cardW;
      svg
        .append("line")
        .attr("x1", prevX + 4)
        .attr("y1", y + cardH / 2)
        .attr("x2", x - 4)
        .attr("y2", y + cardH / 2)
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#rmap-arrow)");
    }

    const g = svg
      .append("g")
      .attr("class", "rmap-node")
      .attr("transform", `translate(${x},${y})`)
      .style("cursor", "pointer")
      .on("click", () => (location.href = c.lesson));

    g.append("rect")
      .attr("width", cardW)
      .attr("height", cardH)
      .attr("rx", 12)
      .attr("fill", "#fff")
      .attr("stroke", c.color)
      .attr("stroke-width", 2);

    g.append("rect")
      .attr("width", 6)
      .attr("height", cardH)
      .attr("rx", 3)
      .attr("fill", c.color);

    g.append("text")
      .attr("x", 18)
      .attr("y", 26)
      .attr("font-size", 12)
      .attr("font-weight", 700)
      .attr("fill", c.color)
      .text(`第 ${c.no} 章`);

    // 标题（超长自动换行）
    const words = c.title.split("");
    const line1 = words.slice(0, 8).join("");
    const line2 = words.slice(8).join("");
    g.append("text")
      .attr("x", 18)
      .attr("y", 50)
      .attr("font-size", 15)
      .attr("font-weight", 700)
      .attr("fill", "#1e1b4b")
      .text(line1);
    if (line2) {
      g.append("text")
        .attr("x", 18)
        .attr("y", 69)
        .attr("font-size", 15)
        .attr("font-weight", 700)
        .attr("fill", "#1e1b4b")
        .text(line2);
    }

    g.append("text")
      .attr("x", 18)
      .attr("y", 92)
      .attr("font-size", 11)
      .attr("fill", "#64748b")
      .text(`${c.level} · ${c.hours.replace("约 ", "")} · ${c.count} 节`);

    // 前置标签
    svg
      .append("text")
      .attr("class", "rmap-edge-label")
      .attr("x", cx)
      .attr("y", y + cardH + 22)
      .text(i === 0 ? "起点" : "前置：" + CHAPTERS[i - 1].title);
  });

  // 终点标注
  const lastX = padX + (CHAPTERS.length - 1) * step + cardW;
  svg
    .append("text")
    .attr("x", lastX - 6)
    .attr("y", 26)
    .attr("font-size", 12)
    .attr("fill", "#94a3b8")
    .attr("text-anchor", "end")
    .text("→ 综合应用");
}

/* =====================================================================
 * 2. 概念地图
 * ===================================================================== */
const ANCHORS = {
  1: [190, 150],
  2: [660, 130],
  3: [880, 350],
  4: [560, 520],
  5: [170, 460],
};

function renderConceptMap() {
  const host = document.getElementById("conceptmap");
  if (!host) return;
  if (!d3) {
    return fallback(
      host,
      "（D3 未加载）概念列表：" +
        CONCEPTS.map((n) => n.no + " " + n.label).join(" · ")
    );
  }

  const W = 1060;
  const H = 600;
  const tip = document.getElementById("cm-tip");

  const svg = d3
    .select(host)
    .append("svg")
    .attr("id", "conceptmap-svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("role", "img")
    .attr("aria-label", "可视化课程概念地图");

  // 章节簇背景
  const cluster = svg.append("g").attr("class", "cm-clusters");
  CHAPTERS.forEach((c) => {
    const [ax, ay] = ANCHORS[c.no];
    cluster
      .append("circle")
      .attr("cx", ax)
      .attr("cy", ay)
      .attr("r", 108)
      .attr("fill", c.color)
      .attr("opacity", 0.055);
    cluster
      .append("text")
      .attr("x", ax)
      .attr("y", ay - 118)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("font-weight", 700)
      .attr("fill", c.color)
      .text(`第 ${c.no} 章 · ${c.title}`);
  });

  const nodes = CONCEPTS.map((n) => Object.assign({}, n));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const links = LINKS.filter(([a, b]) => byId.has(a) && byId.has(b)).map(
    ([source, target]) => ({ source, target })
  );

  const rOf = (n) => 9 + Math.min(n.kw.length, 6) * 1.6;

  const linkSel = svg
    .append("g")
    .attr("stroke", "#cbd5e1")
    .attr("stroke-opacity", 0.55)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 1.4);

  const nodeSel = svg
    .append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", "cm-node")
    .style("cursor", "pointer")
    .on("click", (ev, d) => (location.href = lessonOf(d.ch) + "#" + d.id))
    .on("mouseover", (ev, d) => {
      if (!tip) return;
      const c = CHAPTERS.find((x) => x.no === d.ch);
      tip.innerHTML = `<b style="color:${c.color}">${d.no} ${d.label}</b> · 第 ${d.ch} 章：${d.desc}`;
    })
    .on("mouseout", () => {
      if (!tip) return;
      tip.textContent = "提示：点击任一圆点直接跳到对应小节的「讲解」。";
    });

  nodeSel
    .append("circle")
    .attr("r", (d) => rOf(d))
    .attr("fill", (d) => colorOf(d.ch))
    .attr("fill-opacity", 0.85)
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5);

  nodeSel
    .append("text")
    .attr("y", (d) => rOf(d) + 12)
    .attr("text-anchor", "middle")
    .attr("font-size", 10.5)
    .attr("fill", "#334155")
    .text((d) => d.label);

  const sim = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(78)
        .strength(0.5)
    )
    .force("charge", d3.forceManyBody().strength(-260))
    .force("x", d3.forceX((d) => ANCHORS[d.ch][0]).strength(0.09))
    .force("y", d3.forceY((d) => ANCHORS[d.ch][1]).strength(0.09))
    .force("collide", d3.forceCollide((d) => rOf(d) + 26))
    .on("tick", () => {
      linkSel
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

  nodeSel.call(
    d3
      .drag()
      .on("start", (ev, d) => {
        if (!ev.active) sim.alphaTarget(0.25).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (ev, d) => {
        d.fx = ev.x;
        d.fy = ev.y;
      })
      .on("end", (ev, d) => {
        if (!ev.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      })
  );

  // 图例 + 章节筛选
  const legend = document.getElementById("cm-legend");
  if (legend) {
    const off = new Set();
    CHAPTERS.forEach((c) => {
      const b = document.createElement("button");
      b.innerHTML = `<span class="dot" style="color:${c.color}"></span>第 ${c.no} 章 · ${c.title}`;
      b.addEventListener("click", () => {
        if (off.has(c.no)) off.delete(c.no);
        else off.add(c.no);
        b.classList.toggle("off", off.has(c.no));
        nodeSel.attr("opacity", (d) => (off.has(d.ch) ? 0.12 : 1));
        linkSel.attr("stroke-opacity", (d) =>
          off.has(d.source.ch) || off.has(d.target.ch) ? 0.06 : 0.55
        );
      });
      legend.appendChild(b);
    });
    const all = document.createElement("button");
    all.textContent = "显示全部";
    all.addEventListener("click", () => {
      off.clear();
      legend.querySelectorAll("button").forEach((x) => x.classList.remove("off"));
      nodeSel.attr("opacity", 1);
      linkSel.attr("stroke-opacity", 0.55);
    });
    legend.appendChild(all);
  }
}

/* =====================================================================
 * 3. 学习进度总览
 * ===================================================================== */
function renderProgress() {
  const ringHost = document.getElementById("progress-ring");
  const rowsHost = document.getElementById("progress-rows");
  if (!rowsHost) return;
  const counts = chapterCounts();
  const done = counts.reduce((s, c) => s + c.done, 0);
  const total = counts.reduce((s, c) => s + c.total, 0);
  const pct = total ? done / total : 0;

  /* 环形图 */
  if (ringHost && d3) {
    const size = 220;
    const r = 88;
    const svg = d3
      .select(ringHost)
      .append("svg")
      .attr("viewBox", `0 0 ${size} ${size}`);
    const g = svg
      .append("g")
      .attr("transform", `translate(${size / 2},${size / 2})`);
    g.append("path")
      .attr("d", d3.arc().innerRadius(r - 16).outerRadius(r).startAngle(0).endAngle(2 * Math.PI)())
      .attr("fill", "#f1f5f9");
    g.append("path")
      .attr("d", d3.arc().innerRadius(r - 16).outerRadius(r).startAngle(0).endAngle(2 * Math.PI * pct)())
      .attr("fill", "#6366f1");
  }

  /* 章节条 */
  rowsHost.innerHTML = "";
  counts.forEach((c) => {
    const ch = CHAPTERS.find((x) => x.no === c.ch);
    const p = c.total ? (c.done / c.total) * 100 : 0;
    const row = document.createElement("div");
    row.className = "progress-row";
    row.innerHTML = `
      <span class="pr-name" style="color:${ch.color}">第 ${ch.no} 章 · ${ch.title}</span>
      <span class="pr-bar"><i style="background:${ch.color};width:${p}%"></i></span>
      <span class="pr-num">${c.done} / ${c.total}</span>`;
    rowsHost.appendChild(row);
  });

  const label = document.getElementById("progress-label");
  if (label) {
    label.innerHTML = `<b>${(pct * 100).toFixed(0)}%</b><span>${done} / ${total} 小节已掌握</span>`;
  }

  const reset = document.getElementById("progress-reset");
  if (reset && !reset.dataset.bound) {
    reset.dataset.bound = "1";
    reset.addEventListener("click", () => {
      if (!confirm("确定要清空全部「已掌握」记录吗？此操作不可撤销。")) return;
      try {
        localStorage.removeItem(PROGRESS_KEY);
      } catch (e) {
        /* ignore */
      }
      location.reload();
    });
  }
}

/* =====================================================================
 * 4. 全局搜索
 * ===================================================================== */
function buildSearchIndex() {
  const entries = [];
  CHAPTERS.forEach((c) => {
    entries.push({
      type: "章节",
      ch: c.no,
      no: "第 " + c.no + " 章",
      title: c.title,
      desc: c.blurb,
      kw: c.tags.join(" · "),
      href: c.lesson,
    });
  });
  CONCEPTS.forEach((n) => {
    entries.push({
      type: "小节",
      ch: n.ch,
      no: n.no,
      title: n.label,
      desc: n.desc,
      kw: n.kw.join(" · "),
      href: lessonOf(n.ch) + "#" + n.id,
    });
  });
  return entries;
}

function esc(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function hl(text, q) {
  if (!q) return esc(text);
  const re = new RegExp("(" + escRe(q) + ")", "gi");
  return esc(text).replace(re, "<mark>$1</mark>");
}

function initSearch() {
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  const hot = document.getElementById("search-hot");
  const filters = document.getElementById("search-filters");
  if (!input || !results) return;

  const index = buildSearchIndex();
  let activeCh = 0; // 0 = 全部

  if (filters) {
    const all = document.createElement("button");
    all.className = "active";
    all.textContent = "全部";
    all.addEventListener("click", () => {
      activeCh = 0;
      filters.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === all));
      run();
    });
    filters.appendChild(all);
    CHAPTERS.forEach((c) => {
      const b = document.createElement("button");
      b.textContent = "第 " + c.no + " 章";
      b.addEventListener("click", () => {
        activeCh = activeCh === c.no ? 0 : c.no;
        filters.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b || (activeCh === 0 && x === all)));
        if (activeCh === 0) all.classList.add("active");
        run();
      });
      filters.appendChild(b);
    });
  }

  function run() {
    const q = input.value.trim();
    const pool = index.filter((e) => activeCh === 0 || e.ch === activeCh);
    if (!q) {
      results.innerHTML =
        '<p class="search-empty">输入关键词开始搜索，例如「rollup」「Lab」「螺旋」「45」。</p>';
      return;
    }
    const ql = q.toLowerCase();
    const hits = pool.filter(
      (e) =>
        e.title.toLowerCase().includes(ql) ||
        e.desc.toLowerCase().includes(ql) ||
        e.kw.toLowerCase().includes(ql) ||
        e.no.toLowerCase().includes(ql)
    );
    if (!hits.length) {
      results.innerHTML = `<p class="search-empty">没有找到与「${esc(q)}」相关的内容，换个关键词试试。</p>`;
      return;
    }
    results.innerHTML = hits
      .map((e) => {
        const c = CHAPTERS.find((x) => x.no === e.ch);
        return `<a class="search-item" href="${e.href}">
          <span class="si-no" style="background:${c.color}">${esc(e.no)}</span>
          <span class="si-main">
            <span class="si-title">${hl(e.title, q)}</span>
            <span class="si-desc">${hl(e.desc, q)}</span>
            <span class="si-kw">关键词：${hl(e.kw, q)}</span>
          </span>
        </a>`;
      })
      .join("");
  }

  input.addEventListener("input", run);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = results.querySelector("a.search-item");
      if (first) location.href = first.getAttribute("href");
    }
  });

  if (hot) {
    ["rollup", "视觉通道", "Lab", "colormap", "45", "螺旋", "Storyline", "色盲"].forEach(
      (k) => {
        const b = document.createElement("button");
        b.textContent = k;
        b.addEventListener("click", () => {
          input.value = k;
          run();
          input.focus();
        });
        hot.appendChild(b);
      }
    );
  }

  run();
}

/* ---------------- 章节卡片进度注入 ---------------- */
function paintCardProgress() {
  const counts = chapterCounts();
  document.querySelectorAll(".card[data-chapter]").forEach((card) => {
    const no = parseInt(card.dataset.chapter, 10);
    const c = counts.find((x) => x.ch === no);
    if (!c) return;
    const bar = card.querySelector(".card-progress-bar i");
    const txt = card.querySelector(".card-progress-text");
    if (bar) bar.style.width = (c.total ? (c.done / c.total) * 100 : 0) + "%";
    if (txt) txt.textContent = `${c.done} / ${c.total} 节已掌握`;
  });
}

/* ---------------- 启动 ---------------- */
function boot() {
  renderRoadmap();
  renderConceptMap();
  renderProgress();
  initSearch();
  paintCardProgress();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

/* 从 lesson 页返回门户时刷新进度 */
window.addEventListener("focus", () => {
  renderProgress();
  paintCardProgress();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    renderProgress();
    paintCardProgress();
  }
});
