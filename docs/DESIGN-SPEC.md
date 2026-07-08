# 自由简历 — 设计规范 v2

> 混合方案：Tool-First 工具质感 + Paper-First 纸张质感
> 脱离 Apple 风格与 AI 模板化视觉语言

---

## 一、设计原则

1. **工具感** — 专注于高效编辑，不堆砌装饰，每一个视觉元素都有功能目的
2. **纸张感** — 保留"简历是纸"的产品属性，Canvas 区有纸张质感，编辑区保持工具界面效率
3. **克制** — 最小数量的颜色、最小圆角种类、最小字号层级
4. **一致** — 全站共用一套 Token，无特例

---

## 二、色彩体系

### 2.1 明色模式（Light）

```
Neutral 背景 — 冷灰基调（工具感）
  --bg-base:       hsl(225 20% 97%)    #F5F6FA  极浅冷灰
  --bg-card:       hsl(0 0% 100%)      #FFFFFF  卡片白色
  --bg-canvas:     hsl(40 18% 96%)     #F5F2ED  纸张底色（预览区）
  --bg-canvas-paper: hsl(0 0% 100%)    #FFFFFF  纸上纯白（A4 区域）

Text 层级
  --text-primary:   hsl(225 14% 18%)   #282A2E  正文深灰
  --text-secondary: hsl(225 10% 46%)   #6A6D74  辅助文字
  --text-tertiary:  hsl(225 8% 62%)    #9699A0  占位/禁用文字
  --text-inverse:   hsl(0 0% 100%)     #FFFFFF  反色

Border
  --border-default: hsl(225 14% 90%)   #E1E3E8  默认边框
  --border-hover:   hsl(225 12% 82%)   #CBCED4  悬停边框

Brand
  --brand:          hsl(235 70% 50%)   #2D3FE0  Indigo（非蓝）
  --brand-hover:    hsl(235 65% 44%)   #2332C4
  --brand-light:    hsl(235 60% 96%)   #EEF0FF

Status
  --accent:         hsl(15 75% 50%)    #D95C2B  暖橙点缀
  --success:        hsl(160 55% 40%)   #2E9E6E
  --warning:        hsl(35 85% 50%)    #E88B1E
  --danger:         hsl(0 65% 50%)     #D13030
```

### 2.2 暗色模式（Dark）

```
--bg-base:       hsl(225 16% 8%)     #0F1012
--bg-card:       hsl(225 14% 12%)    #18191D
--bg-canvas:     hsl(40 10% 12%)     #1F1D19
--bg-canvas-paper: #FFFFFF（保持白纸）

--text-primary:   hsl(225 14% 92%)   #E6E8ED
--text-secondary: hsl(225 10% 60%)   #91959C
--text-tertiary:  hsl(225 8% 40%)    #5E6066

--border-default: hsl(225 12% 22%)   #303238
--border-hover:   hsl(225 10% 32%)   #484A50

--brand:          hsl(235 65% 60%)   #5A6BFF
--brand-hover:    hsl(235 60% 52%)   #3D4EE0
--brand-light:    hsl(235 40% 18%)   #1E1F3A
```

---

## 三、排版

```
字体系列:
  --font-sans: 'Inter', -apple-system, 'PingFang SC', system-ui, sans-serif
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace

字号层级:
  .text-display:  font-size 2rem / 1.75rem / 1.5rem   — 大标题
  .text-heading:  font-size 1.25rem / 1.125rem / 1rem  — 小标题
  .text-body:     font-size 0.9375rem (15px)             — 正文
  .text-body-sm:  font-size 0.875rem (14px)              — 小字
  .text-caption:  font-size 0.8125rem (13px)             — 标注
  .text-tiny:     font-size 0.75rem (12px)               — 最小标注

行高:
  leading-tight:   1.15
  leading-normal:  1.5
  leading-relaxed: 1.7

字重:
  font-normal: 400
  font-medium: 500
  font-semibold: 600
  font-bold: 700
```

---

## 四、间距系统

基于 8px 网格：

```
gap-2:    2px    极小间距（图标与文字）
gap-4:    4px    微间距
gap-6:    6px    元素内间距
gap-8:    8px    紧凑间距
gap-12:   12px   组件内间距
gap-16:   16px   组件间距
gap-20:   20px   卡片内填充
gap-24:   24px   卡片间距
gap-32:   32px   Section 间距
gap-40:   40px   大区块间距
gap-48:   48px   页面区块间距
gap-64:   64px   大 Section 间距
gap-80:   80px   页面上方/下方间距
```

---

## 五、圆角

| Token | 值 | 用途 |
|-------|-----|------|
| --radius-sm | 4px | 标签、徽章 |
| --radius-md | 6px | 输入框、按钮、小卡片 |
| --radius-lg | 8px | 卡片、对话框 |
| --radius-xl | 12px | 大卡片、弹窗 |
| --radius-2xl | 16px | 特大区块 |
| --radius-full | 9999px | 仅标签用 |

**关键区别**: 按钮默认 `rounded-md`（6px），不用全圆角。

---

## 六、阴影

```
--shadow-sm:  0 1px 3px rgba(0,0,0,0.06)
--shadow-md:  0 4px 12px rgba(0,0,0,0.07)
--shadow-lg:  0 8px 24px rgba(0,0,0,0.08)
--shadow-xl:  0 16px 40px rgba(0,0,0,0.10)
```

**不使用**：
- ❌ 大型 blur 渐变光晕
- ❌ 多层渐变背景色块
- ❌ 装饰性光斑

---

## 七、组件规范

### Button

```
默认按钮:   h-9 px-4 rounded-md text-14 font-medium
  背景: bg-brand → hover:bg-brand-hover
  文字: text-white
  过渡: transition-all duration-150 ease-in-out
  active: scale-[0.97]

Outline:   border border-default bg-transparent
  文字: text-primary
  hover: bg-accent-subtle

Ghost:     bg-transparent
  文字: text-secondary
  hover: bg-accent-subtle

尺寸:
  sm:  h-8  px-3 text-13
  md:  h-9  px-4 text-14 (默认)
  lg:  h-10 px-5 text-15
```

### Input / Select

```
高度: h-9
内填充: px-3
圆角: rounded-md
边框: border-default → focus:border-brand ring-brand/30
背景: bg-card
文字: text-primary / text-tertiary(placeholder)
```

### Card（落地页）

```
背景: bg-card
边框: border-default
圆角: rounded-lg
hover: shadow-md
```

### Dashboard 列表

```
列表条: border-b border-default
hover:  bg-[var(--brand-light)]
操作: 靠右对齐
```

### Dialog / Drawer

```
Dialog:  rounded-xl, shadow-xl
Drawer:  header: border-b border-default, body: p-6
```

---

## 八、页面布局规范

### Landing Page

```
Header:   h-14 sticky top-0 bg-base/80 backdrop-blur-sm
Logo:     文字+简单图标，底部平面图标
CTA:      平面风格，边框式或填充式，无渐变背景
Section:  间距 py-24 sm:py-32
宽度:     max-w-7xl px-4 sm:px-6 lg:px-8
```

**移除**：
- ❌ 全屏渐变光晕
- ❌ 装饰性模糊圆
- ❌ 胶囊形 CTA 按钮
- ❌ 大字号负字距标题

### Dashboard

```
Header:   复用 Landing Header（同一组件）
列表:     列表条样式，不用 t-card 堆叠
新建按钮: outline 样式，不突出
```

### Workbench

```
Header:   h-14 border-bottom 紧凑布局
编辑侧栏: bg-card，列表式模块选择
预览区:   bg-canvas（纸张暖底色）
A4 区域:  bg-canvas-paper，shadow-lg
分割条:   品牌色分割线
```

---

## 九、全局审计问题清单

| # | 问题 | 涉及文件 | 严重度 |
|---|------|---------|--------|
| 1 | Apple 渐变光晕背景 | HeroSection, CTA, TemplatePreview | **HIGH** |
| 2 | 胶囊形按钮 (!rounded-full) | HeroSection, TemplatePreview, CTA | **HIGH** |
| 3 | 硬编码 Tailwind gray (text-gray-*) | Dashboard, SidePanel, EditPanel | **HIGH** |
| 4 | TDesign 未对接品牌色 | 全站 t-button/t-input 等 | MEDIUM |
| 5 | Dashboard Header 与 Landing Header 不一致 | dashboard/index.vue | MEDIUM |
| 6 | Splitpanes 分割条为默认样式 | workbench/[id].vue | LOW |
| 7 | SF Pro Display 独占字体声明 | main.css | MEDIUM |
| 8 | Apple Blue #0071e3 主色 | main.css，全站 | **HIGH** |
| 9 | 卡片 hover 动画过度 | FeaturesSection | LOW |
| 10 | 无统一布局间距规范 | 各页面 | MEDIUM |

---

## 十、修复顺序

```
Phase 1 — CSS Token 层（先改颜色、字体、圆角、阴影）
  1. 更新 main.css: 替换颜色变量、字体、圆角
  2. 所有文件: text-gray-* → var(--text-*) 替换
  3. 删除渐变光晕相关样式

Phase 2 — 组件层（全局组件改造）
  4. 更新按钮样式: rounded-full → rounded-md
  5. TDesign ConfigProvider 对接品牌色
  6. 统一全站 Header

Phase 3 — 页面层（逐个页面重写）
  7. Landing Page 各 Section 改造
  8. Dashboard 列表改造
  9. Workbench 布局改造

Phase 4 — 打磨
  10. Splitpanes 样式
  11. 动效统一
  12. 暗色模式检查
```
