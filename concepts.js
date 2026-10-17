/* =====================================================================
 * concepts.js —— 课程知识图谱数据（门户专用，零依赖 ES Module）
 *
 * 用途（由 index.html 消费）：
 *   1. 学习路径 roadmap
 *   2. 概念地图（D3 force-directed graph）
 *   3. 全局搜索索引
 *   4. 学习进度总览（章节小节数）
 *
 * 数据组织：一个节点 = 一个小节（与 lesson 页面 #ch-x-y 锚点一一对应）。
 * ===================================================================== */

export const CHAPTERS = [
  {
    no: 1,
    key: "data",
    title: "数据",
    lesson: "lesson-01/",
    color: "#6366f1",
    level: "入门",
    hours: "约 2 小时",
    prereq: "无（起点）",
    blurb: "一切可视化的原料。先把数据看清、看懂，才谈得上画得对。",
    tags: ["DIKW 金字塔", "Stevens 4 尺度", "Mackinlay 视觉通道", "d3 数组变换", "Selection 三态"],
    count: 5,
  },
  {
    no: 2,
    key: "flow",
    title: "数据可视化流程",
    lesson: "lesson-02/",
    color: "#4f46e5",
    level: "入门 → 进阶",
    hours: "约 2 小时",
    prereq: "第 1 章 · 数据",
    blurb: "把「原始数据 → 图」这件事拆成可复用的四步流水线（Card 模型）。",
    tags: ["Card 数据流模型", "d3.rollup 聚合", "视觉映射", "Reingold-Tilford", "事件委托"],
    count: 4,
  },
  {
    no: 3,
    key: "color",
    title: "色彩专题",
    lesson: "lesson-03/",
    color: "#4338ca",
    level: "进阶",
    hours: "约 3 小时",
    prereq: "第 1 章 · 数据属性",
    blurb: "颜色是最强也最容易被滥用的视觉通道。8 小节把配色讲透。",
    tags: ["4 颜色空间", "colormap 三类", "CIE Lab", "5 大色系", "Wong / Paul Tol", "CVD 无障碍"],
    count: 8,
  },
  {
    no: 4,
    key: "lowdim",
    title: "低维数据可视化",
    lesson: "lesson-04/",
    color: "#3730a3",
    level: "进阶",
    hours: "约 2 小时",
    prereq: "第 2 章 · 流程",
    blurb: "二维平面的极限用法：坐标变换、曲线拟合、倾角感知与等值线。",
    tags: ["三层坐标变换", "log/sqrt 尺度", "10 种曲线拟合", "Cleveland 45°", "Marching Squares"],
    count: 5,
  },
  {
    no: 5,
    key: "timeseries",
    title: "时序数据可视化",
    lesson: "lesson-05/",
    color: "#312e81",
    level: "进阶 → 综合",
    hours: "约 2 小时",
    prereq: "第 4 章 · 低维可视化",
    blurb: "时间是特殊的连续属性：可分解、可周期化、可叙事化。",
    tags: ["时间 5 属性", "折线图", "日历热图", "阿基米德螺旋", "Storyline"],
    count: 5,
  },
];

export const CONCEPTS = [
  // ---------- 第 1 章 ----------
  { id: "ch-1-1", no: "1.1", label: "数据生成", ch: 1, diff: 1,
    desc: "用 d3.csv 异步读取 CSV，做中文字段 → 英文变量映射与类型转换。",
    kw: ["d3.csv", "异步加载", "字段映射", "类型转换"] },
  { id: "ch-1-2", no: "1.2", label: "数据定义", ch: 1, diff: 1,
    desc: "DIKW 金字塔（数据→信息→知识→智慧）与数据质量四维度。",
    kw: ["DIKW", "数据质量", "Wang & Strong"] },
  { id: "ch-1-3", no: "1.3", label: "数据属性", ch: 1, diff: 2,
    desc: "Stevens 四尺度（标称/有序/等距/等比）与 Mackinlay 视觉通道表达力排序。",
    kw: ["标称", "有序", "等距", "等比", "视觉通道", "表达力"] },
  { id: "ch-1-4", no: "1.4", label: "数据变换", ch: 1, diff: 2,
    desc: "d3 数组工具：group / rollup / sum / bin / extent 等统计与变换。",
    kw: ["d3.rollup", "d3.group", "d3.sum", "d3.bin", "d3.extent"] },
  { id: "ch-1-5", no: "1.5", label: "D3 数据选择器", ch: 1, diff: 3,
    desc: "Selection 三态 enter / update / exit 与 data-join：声明式更新 DOM。",
    kw: ["selection", "data join", "enter", "update", "exit"] },

  // ---------- 第 2 章 ----------
  { id: "ch-2-1", no: "2.1", label: "数据可视化流程", ch: 2, diff: 2,
    desc: "Card 三阶段数据流模型：原数据 → 数据表 → 视觉结构 → 视图。",
    kw: ["Card 模型", "数据流", "流程", "参考模型"] },
  { id: "ch-2-2", no: "2.2", label: "数据变换：原数据 → 数据表", ch: 2, diff: 2,
    desc: "用 d3.rollup 把明细数据聚合成分类树，再转成树形列表。",
    kw: ["聚合", "层次结构", "d3.rollup", "树"] },
  { id: "ch-2-3", no: "2.3", label: "视觉映射：数据表 → 视觉结构", ch: 2, diff: 3,
    desc: "把数据属性映射到视觉通道（位置/颜色/尺寸），决定图的表达力。",
    kw: ["视觉编码", "通道", "映射", "编码器"] },
  { id: "ch-2-4", no: "2.4", label: "视图渲染与用户交互", ch: 2, diff: 3,
    desc: "Reingold-Tilford 树布局 + DOM 事件委托，实现可交互的渲染。",
    kw: ["Reingold-Tilford", "树布局", "事件委托", "交互"] },

  // ---------- 第 3 章 ----------
  { id: "ch-3-1", no: "3.1", label: "颜色模型基础", ch: 3, diff: 1,
    desc: "RGB / HSV / HSL / CIE Lab 四个颜色空间的区别与适用场景。",
    kw: ["RGB", "HSV", "HSL", "CIE Lab", "颜色空间"] },
  { id: "ch-3-2", no: "3.2", label: "colormap 三类选择", ch: 3, diff: 2,
    desc: "顺序型 / 发散型 / 分类型 colormap 的判据与选型方法。",
    kw: ["sequential", "diverging", "categorical", "colormap"] },
  { id: "ch-3-3", no: "3.3", label: "CIE Lab 色域图", ch: 3, diff: 3,
    desc: "Lab 的感知均匀性、a/b 色域边界，以及为什么它比 RGB 更“公平”。",
    kw: ["感知均匀", "色域", "a-b 平面", "色差 ΔE"] },
  { id: "ch-3-4", no: "3.4", label: "色系搭配规则（5 大类）", ch: 3, diff: 2,
    desc: "单色 / 邻近 / 互补 / 分裂互补 / 三角 五类配色方案的色轮推导。",
    kw: ["色轮", "邻近色", "互补色", "三角配色"] },
  { id: "ch-3-5", no: "3.5", label: "科研经典配色", ch: 3, diff: 1,
    desc: "Wong、Paul Tol、viridis 等经过检验的科研配色方案直接可用。",
    kw: ["Wong", "Paul Tol", "viridis", "科研配色"] },
  { id: "ch-3-6", no: "3.6", label: "对错案例对比", ch: 3, diff: 1,
    desc: "彩虹色、红绿对比、高饱和堆叠等常见错误配色与修正方案。",
    kw: ["反例", "彩虹色", "红绿对比", "饱和度"] },
  { id: "ch-3-7", no: "3.7", label: "鲜艳 + 低饱和 生成器", ch: 3, diff: 3,
    desc: "“高辨识度 + 低饱和”配色哲学的交互式生成器与参数解释。",
    kw: ["色相互补", "饱和度", "明度", "生成器"] },
  { id: "ch-3-8", no: "3.8", label: "CVD 论文图测", ch: 3, diff: 3,
    desc: "用色盲（CVD）模拟检验论文配图的可读性，做无障碍设计。",
    kw: ["CVD", "色盲模拟", "无障碍", "可读性"] },

  // ---------- 第 4 章 ----------
  { id: "ch-4-1", no: "4.1", label: "数据转换", ch: 4, diff: 2,
    desc: "长宽表转换、归一化、缺失值处理等进入绘图前的整理动作。",
    kw: ["长宽转换", "归一化", "缺失值"] },
  { id: "ch-4-2", no: "4.2", label: "坐标轴变换", ch: 4, diff: 3,
    desc: "数据空间 → 绘图空间 → 屏幕空间的三层变换，以及 log / sqrt 尺度。",
    kw: ["d3.scale", "对数坐标", "屏幕坐标", "三层变换"] },
  { id: "ch-4-3", no: "4.3", label: "曲线拟合", ch: 4, diff: 3,
    desc: "LOESS、多项式、样条等 10 种拟合/平滑方法的效果对比。",
    kw: ["LOESS", "回归", "平滑", "样条"] },
  { id: "ch-4-4", no: "4.4", label: "倾角感知（45° 黄金角）", ch: 4, diff: 2,
    desc: "Cleveland 研究：平均倾角 45° 时斜率判断最准（banking to 45°）。",
    kw: ["Cleveland", "banking", "45 度", "斜率感知"] },
  { id: "ch-4-5", no: "4.5", label: "等值线（Marching Squares）", ch: 4, diff: 3,
    desc: "Marching Squares 算法：从标量场提取等值线与等高线。",
    kw: ["marching squares", "等值线", "等高线", "标量场"] },

  // ---------- 第 5 章 ----------
  { id: "ch-5-1", no: "5.1", label: "时间属性", ch: 5, diff: 2,
    desc: "时间的 5 个属性：尺度、范围、粒度、周期性、确定性。",
    kw: ["时间尺度", "粒度", "周期性", "线性/循环"] },
  { id: "ch-5-2", no: "5.2", label: "标准时间可视化（折线图）", ch: 5, diff: 1,
    desc: "折线图作为时间序列的默认选择，及其适用边界。",
    kw: ["折线图", "趋势", "时间轴"] },
  { id: "ch-5-3", no: "5.3", label: "日历热图（van Wijk）", ch: 5, diff: 2,
    desc: "van Wijk 日历布局：把多天多指标压进一屏并保持可读。",
    kw: ["日历布局", "热图", "小倍数"] },
  { id: "ch-5-4", no: "5.4", label: "周期时间可视化（阿基米德螺旋）", ch: 5, diff: 3,
    desc: "用阿基米德螺旋把循环时间映射到极坐标，兼顾周期与趋势。",
    kw: ["阿基米德螺旋", "极坐标", "循环时间"] },
  { id: "ch-5-5", no: "5.5", label: "Storyline 时间线", ch: 5, diff: 3,
    desc: "故事线（叙事可视化）：以《侏罗纪公园》为例的事件-实体时间线。",
    kw: ["Storyline", "叙事可视化", "事件线", "实体"] },
];

/* 概念之间的关联（先修 / 递进 / 交叉引用），用于概念地图连线 */
export const LINKS = [
  // 第 1 章内部
  ["ch-1-1", "ch-1-2"], ["ch-1-2", "ch-1-3"], ["ch-1-3", "ch-1-4"], ["ch-1-4", "ch-1-5"],
  // 第 2 章内部
  ["ch-2-1", "ch-2-2"], ["ch-2-2", "ch-2-3"], ["ch-2-3", "ch-2-4"],
  // 第 3 章内部
  ["ch-3-1", "ch-3-2"], ["ch-3-2", "ch-3-3"], ["ch-3-1", "ch-3-4"],
  ["ch-3-2", "ch-3-5"], ["ch-3-4", "ch-3-6"], ["ch-3-4", "ch-3-7"], ["ch-3-2", "ch-3-8"],
  // 第 4 章内部
  ["ch-4-1", "ch-4-2"], ["ch-4-2", "ch-4-4"], ["ch-4-3", "ch-4-5"], ["ch-4-2", "ch-4-3"],
  // 第 5 章内部
  ["ch-5-1", "ch-5-2"], ["ch-5-1", "ch-5-3"], ["ch-5-3", "ch-5-4"], ["ch-5-1", "ch-5-5"],
  // 跨章交叉引用
  ["ch-1-3", "ch-2-3"],   // 数据属性 → 视觉映射
  ["ch-1-4", "ch-2-2"],   // 数据变换（同源工具）
  ["ch-1-5", "ch-2-4"],   // Selection → 视图渲染
  ["ch-2-3", "ch-3-2"],   // 视觉映射 → colormap
  ["ch-3-3", "ch-3-4"],   // Lab → 色系
  ["ch-4-2", "ch-5-2"],   // 坐标变换 → 折线图
  ["ch-4-3", "ch-5-2"],   // 曲线拟合 → 趋势线
  ["ch-5-3", "ch-4-5"],   // 日历热图 → 等值线（连续场）
];

/* 概念地图节点 id → lesson 路径 */
export function lessonOf(ch) {
  return "lesson-0" + ch + "/";
}
