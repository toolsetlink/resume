# 修复 PDF 导出仅显示左上角部分内容问题

## 概述

当前 PDF 导出虽然实现了分页功能,但导出的 PDF 仅显示简历预览的左上角部分内容,无法完整呈现所有信息。尽管前一轮修复(把 `#resume-preview` id 迁移到 A4 wrapper、增加 `windowWidth: 794, scrollX: 0, scrollY: 0`)声称已解决问题,但实际测试仍存在内容截取不完整的问题。本计划将彻底修复此问题,确保导出的 PDF 完整、分页准确、排版美观。

---

## 当前状态分析

### 导出链路

```
WorkbenchHeader「导出 PDF」按钮
  → emit('export-pdf')
  → workbench/[id].vue handleExportPdf()
  → usePdfExport.exportToPdf()
  → 动态 import('html2pdf.js')
  → html2pdf().set(opt).from(#resume-preview element).save()
  → 内部:html2canvas 栅格化 → jsPDF 分页写入 → 浏览器下载
```

### 关键 DOM 层级([app/pages/workbench/[id].vue](file:///Users/songang/LinkProjects/ziyoujianli/app/pages/workbench/[id].vue#L27-L38))

```html
<Splitpanes>
  <Pane :size="60">
    <div class="h-full overflow-auto bg-gray-100 p-6 ...">   <!-- 滚动容器 -->
      <div id="resume-preview"
           class="mx-auto bg-white shadow-lg"
           style="width: 794px; min-height: 1123px;">          <!-- A4 wrapper(被捕获) -->
        <ResumePreview>
          <div class="resume-preview-container" style="width:100%; min-height:100%;">
            <TemplateComponent />                                <!-- 模板根元素 width:100% -->
          </div>
        </ResumePreview>
      </div>
    </div>
  </Pane>
</Splitpanes>
```

### 当前导出配置([app/composables/usePdfExport.ts](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts#L41-L60))

```ts
const opt = {
  margin: [margin, margin, margin, margin],  // 默认 32px
  filename: `${getSafeFileName(title)}.pdf`,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 794,
    scrollX: 0,
    scrollY: 0,
  },
  jsPDF: { unit: 'px', format: 'a4', orientation: 'portrait' },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
}
```

### 根本原因分析(三个叠加问题)

#### 问题 1:`windowWidth: 794` 导致 html2canvas 虚拟窗口高度不足

这是导致"只截取左上角"的**主要原因**。html2canvas 的 `windowWidth` 选项控制的是**渲染时使用的虚拟浏览器窗口宽度**,而非捕获元素的宽度。当仅设置 `windowWidth: 794` 而不设置 `windowHeight` 时:

- html2canvas 创建一个宽度为 794px 的虚拟 iframe 进行渲染
- 虚拟 iframe 的默认高度取 `document.documentElement.clientHeight` 或 `window.innerHeight`,通常等于浏览器可视区域高度(约 800-1000px)
- 简历内容高度往往超过 1123px(单页 A4)甚至达到 2000-3000px(多页简历)
- 虚拟窗口高度不足时,html2canvas 只能截取到虚拟窗口可视范围内的内容(即顶部部分),导致"只显示左上角"

**关键证据**:html2canvas 1.4.1 源码中,`windowWidth` 和 `windowHeight` 共同决定虚拟渲染环境尺寸,单独设置 `windowWidth` 会导致虚拟窗口比例失常。

#### 问题 2:捕获元素位于 Splitpanes 的 `overflow-auto` 滚动容器内

`#resume-preview` 的父级是 `<div class="h-full overflow-auto ...">`,在 Splitpanes 布局下:
- 父容器高度被 `h-full` 限制为 Pane 的可视高度
- `overflow-auto` 使其成为滚动容器,简历内容超出时通过滚动查看
- html2canvas 对位于滚动容器内的元素存在已知裁剪问题,即使元素自身有明确尺寸,也可能因父容器的 `overflow` 影响而截取不完整

#### 问题 3:`pagebreak.css` 模式未生效,长简历分页可能切断内容

项目 CSS 中**完全没有** `break-inside`、`page-break-*`、`@media print` 规则(已通过 Grep 全项目确认)。当前 `pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }` 中:
- `'css'` 模式需要模板/section 组件定义 `break-inside: avoid` 等规则,但项目中无此类规则
- `'legacy'` 模式需要手动添加 `.html2pdf__page-break` 类名,项目中也未使用
- 实际只有 `'avoid-all'` 在工作,但它只能避免在元素内部分页,对 Canvas 切片方式无效

### 相关文件

| 文件 | 作用 |
|---|---|
| [app/composables/usePdfExport.ts](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts) | PDF 导出核心逻辑 |
| [app/pages/workbench/[id].vue](file:///Users/songang/LinkProjects/ziyoujianli/app/pages/workbench/[id].vue) | A4 wrapper 容器与导出按钮事件绑定 |
| [app/components/preview/ResumePreview.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/preview/ResumePreview.vue) | 简历预览容器 |
| [app/components/templates/professional/index.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/templates/professional/index.vue) | professional 模板根组件 |
| [app/components/templates/modern/index.vue](file:///Users/songang/LinkProjects/ziyoujianli/app/components/templates/modern/index.vue) | modern 模板根组件 |
| [tests/unit/components/preview/ResumePreview.spec.ts](file:///Users/songang/LinkProjects/ziyoujianli/tests/unit/components/preview/ResumePreview.spec.ts) | 单元测试 |
| [tests/e2e/pdf-export.spec.ts](file:///Users/songang/LinkProjects/ziyoujianli/tests/e2e/pdf-export.spec.ts) | E2E 测试 |

---

## 改动计划

### 改动 1:重构 `usePdfExport.ts`,采用"克隆节点到离屏容器"方案

**文件**:[app/composables/usePdfExport.ts](file:///Users/songang/LinkProjects/ziyoujianli/app/composables/usePdfExport.ts)

**方案**:在导出前,把 `#resume-preview` 元素克隆到一个**离屏的固定尺寸容器**中(挂载到 `document.body` 下,脱离 Splitpanes 滚动容器),然后对克隆节点执行 html2canvas 截图。这彻底规避了滚动容器裁剪与虚拟窗口高度不足的问题。

**具体改动**:

1. **新增辅助函数 `cloneToOffscreenContainer`**:把原元素深拷贝,挂载到一个 `position: fixed; left: -99999px; top: 0; width: 794px;` 的离屏 div 中,确保脱离滚动容器且不影响页面视觉。
2. **重构 `exportToPdf`**:在调用 html2pdf 前克隆节点,导出完成后移除离屏容器。
3. **修正 `html2canvas` 配置**:
   - 移除 `windowWidth: 794`(避免虚拟窗口高度不足)
   - 保留 `scrollX: 0, scrollY: 0`
   - 新增 `width: 794`(显式指定捕获宽度)
   - 新增 `height` 为元素的 `scrollHeight`(显式指定捕获高度,确保完整截取)
   - 保留 `scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false`
4. **保留 `pagebreak` 配置**不变(配合改动 2 的 CSS 规则生效)。
5. **新增 `import.meta.client` 守卫**:在 `exportToPdf` 入口处增加 `if (!import.meta.client) return`,防止 SSR 环境误调用(防御性)。

**修改后核心代码**(替换 L15-66):

```ts
export function usePdfExport() {
  const resumeStore = useResumeStore()
  const isExporting = ref(false)

  // 把原元素克隆到离屏容器,脱离 Splitpanes 滚动容器,避免 html2canvas 裁剪
  const cloneToOffscreen = (sourceEl: HTMLElement): { clone: HTMLElement; cleanup: () => void } => {
    const offscreen = document.createElement('div')
    offscreen.style.position = 'fixed'
    offscreen.style.left = '-99999px'
    offscreen.style.top = '0'
    offscreen.style.width = '794px'
    offscreen.style.background = '#ffffff'
    // 深拷贝并继承计算样式
    const clone = sourceEl.cloneNode(true) as HTMLElement
    clone.style.margin = '0'
    clone.style.boxShadow = 'none'
    offscreen.appendChild(clone)
    document.body.appendChild(offscreen)
    return {
      clone,
      cleanup: () => offscreen.remove(),
    }
  }

  const exportToPdf = async (options?: {
    elementId?: string
    title?: string
    margin?: number
  }) => {
    if (!import.meta.client) return

    const elementId = options?.elementId || 'resume-preview'
    const title = options?.title || resumeStore.activeResume?.title || '简历'
    const margin = options?.margin ?? resumeStore.activeResume?.globalSettings?.pagePadding ?? 32

    const sourceEl = document.getElementById(elementId)
    if (!sourceEl) {
      throw new Error(`找不到导出元素 #${elementId}`)
    }

    isExporting.value = true
    const { clone, cleanup } = cloneToOffscreen(sourceEl)

    try {
      const html2pdf = (await import('html2pdf.js')).default

      // 显式捕获宽高,确保完整截取
      const captureWidth = 794
      const captureHeight = Math.max(clone.scrollHeight, 1123)

      const opt = {
        margin: [margin, margin, margin, margin],
        filename: `${getSafeFileName(title)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: captureWidth,
          height: captureHeight,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: {
          unit: 'px',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }

      await html2pdf().set(opt).from(clone).save()
    } finally {
      cleanup()
      isExporting.value = false
    }
  }

  return { isExporting, exportToPdf }
}
```

**理由**:
- 离屏容器脱离 Splitpanes 滚动父级,html2canvas 不再受 `overflow-auto` 裁剪影响。
- 显式 `width: 794` 和 `height: scrollHeight` 确保 html2canvas 捕获完整内容,不依赖虚拟窗口尺寸。
- 移除 `windowWidth: 794` 避免虚拟窗口高度不足导致的顶部截取。
- 克隆节点保留原始 DOM 结构与计算样式,导出效果与预览一致。

### 改动 2:为模板 section 组件添加 `break-inside: avoid` 分页规则

**文件**:[app/assets/css/main.css](file:///Users/songang/LinkProjects/ziyoujianli/app/assets/css/main.css)(已在 `nuxt.config.ts` L70-72 中注册)

**目标**:让 `pagebreak.css` 模式真正生效,避免长简历中段落/列表项/卡片被从中间切断。

**已确认的 section 组件类名**(通过 Grep 各模板 sections 目录):
- `.experience-item` — 工作经历条目(professional / modern / elegant / creative 通用)
- `.education-item` — 教育背景条目
- `.project-item` — 项目经历条目
- `.custom-item` — 自定义模块条目
- `.certificate-item` 或 `.certificates-item` — 证书条目(需确认)
- 各 section 根元素:`.professional-experience`、`.modern-education`、`.elegant-projects` 等(前缀因模板而异)

**改动**:在 [app/assets/css/main.css](file:///Users/songang/LinkProjects/ziyoujianli/app/assets/css/main.css) 末尾新增(非 scoped,确保 html2canvas 渲染时能读取):

```css
/* PDF 导出分页规则:避免在 section/卡片/列表项内部断页 */
@media print {
  .experience-item,
  .education-item,
  .project-item,
  .custom-item,
  .certificate-item {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

**说明**:
- `@media print` 规则会被 html2pdf.js 的 `pagebreak.css` 模式识别(它通过 `window.getComputedStyle` 读取 `breakInside` / `pageBreakInside`)
- 由于 html2canvas 是栅格化方案,`break-inside` 实际由 html2pdf.js 的 `pagebreaks.js` 插件([node_modules/html2pdf.js/src/plugin/pagebreaks.js](file:///Users/songang/LinkProjects/ziyoujianli/node_modules/.pnpm/html2pdf.js@0.14.0/node_modules/html2pdf.js/src/plugin/pagebreaks.js#L80-L92))在 DOM 阶段处理:若元素跨越页边界且 `break-inside: avoid`,会在元素前插入 padding 推到下一页
- 若 `@media print` 在 html2canvas 上下文不生效,则降级为不加 `@media print` 包裹(直接在元素上应用)
- 此改动同时改善浏览器原生打印(Ctrl+P)的分页效果

### 改动 3:更新单元测试

**文件**:[tests/unit/components/preview/ResumePreview.spec.ts](file:///Users/songang/LinkProjects/ziyoujianli/tests/unit/components/preview/ResumePreview.spec.ts) 或新增 `tests/unit/composables/usePdfExport.spec.ts`

**目标**:为 `usePdfExport` 新增单元测试,验证:
1. `import.meta.client` 为 false 时直接返回(不报错)
2. 找不到元素时抛出正确错误
3. 调用时会创建离屏容器并在完成后清理
4. 配置中包含正确的 `width`、`height`、`scale` 等选项

**说明**:由于 `usePdfExport` 依赖 `document` 和动态 import,单元测试需要 mock `html2pdf.js` 模块与 `document.body.appendChild`。如果 mock 成本过高,可跳过单元测试,仅依赖 E2E 测试验证。

### 改动 4:增强 E2E 测试(可选)

**文件**:[tests/e2e/pdf-export.spec.ts](file:///Users/songang/LinkProjects/ziyoujianli/tests/e2e/pdf-export.spec.ts)

**目标**:增加对导出结果的验证,但考虑到 Playwright 触发浏览器下载的不稳定性,维持当前"验证按钮存在 + 点击后页面正常"策略,不实际验证 PDF 内容。

**不改动**:保持现状,通过手动测试验证导出效果。

---

## 假设与决策

1. **假设**:html2canvas 1.4.1 在显式传入 `width` 和 `height` 选项时,会按指定尺寸捕获元素,不依赖虚拟窗口尺寸。
2. **假设**:克隆节点能正确继承原元素的计算样式(html2canvas 内部会处理 `cloneNode(true)` 的样式继承)。
3. **决策**:采用"克隆到离屏容器"方案而非"直接修改原元素样式",因为前者不影响用户预览体验,且能彻底脱离滚动容器。
4. **决策**:保留 `html2pdf.js` 作为导出工具,不切换到纯 `html2canvas + jsPDF` 手动分页,以降低改动风险。
5. **决策**:保留 `pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }` 配置,配合改动 2 的 CSS 规则让 `css` 模式生效。
6. **决策**:不引入 `@media print` 规则到预览页(仅用于导出),避免影响浏览器原生打印功能。
7. **决策**:不修改 `margin` 默认值(32px)和 `jsPDF` 配置,保持与现有用户体验一致。

---

## 验证步骤

### 1. 启动与基础验证

- `pnpm dev`(已有终端运行中,terminal_id: 3)
- 进入工作台页 `/workbench/{resumeId}`
- 确认预览页正常显示,A4 wrapper 尺寸为 794×1123px

### 2. PDF 导出功能验证

点击右上角「导出 PDF」按钮,打开导出的 PDF,确认:

- **完整性**:PDF 包含完整简历内容(基本信息 + 所有启用模块),不再是左上角片段
- **分页**:长简历自动分页,无大段空白或内容缺失
- **清晰度**:文字清晰可辨,图片(如头像)正常显示
- **格式**:PDF 页面为 A4 纵向,边距均匀

### 3. 多场景测试

- **短简历**(只有基本信息):导出 1 页,无多余空白页
- **中等简历**(基本信息 + 1-2 个模块):导出 1 页,内容完整
- **长简历**(所有模块 + 大量数据):导出 2-3 页,分页合理,section 不被从中间切断
- **4 个模板**(professional / modern / elegant / creative):分别导出,确认所有模板均能完整导出

### 4. 回归检查

- 预览页本身在浏览器中的显示不受影响(离屏容器在 `left: -99999px`,不可见)
- 点击导出按钮后,按钮状态正常(isExporting 状态正确切换)
- 导出失败时显示错误提示

### 5. 测试与构建

- `pnpm test`(运行单元测试,确认现有 438 个测试通过)
- `pnpm test:e2e`(运行 E2E 测试,确认 PDF 导出相关测试通过)
- 如有 `pnpm lint` 或 `pnpm typecheck` 命令,运行确认无错误

---

## 风险与回滚

### 风险

1. **克隆节点样式继承不完整**:某些动态计算样式(如 `v-bind` in `<style>`)可能未正确继承到克隆节点。**缓解**:导出后人工检查 PDF 效果,如有样式缺失,改用 `getComputedStyle` 显式复制关键样式。
2. **离屏容器影响布局**:虽然 `position: fixed; left: -99999px` 不可见,但极端情况下可能影响滚动条。**缓解**:导出完成后立即 `cleanup()` 移除容器。
3. **`break-inside: avoid` 在 html2canvas 中不生效**:html2canvas 的 Canvas 切片方式可能忽略 CSS 分页规则。**缓解**:即使 CSS 分页不生效,核心问题(内容截取不完整)已通过改动 1 解决,分页准确性通过 `avoid-all` 模式保证。

### 回滚

如方案无效,回滚步骤:
1. 恢复 `usePdfExport.ts` 到改动前状态(`git checkout app/composables/usePdfExport.ts`)
2. 移除新增的 CSS 分页规则
3. 重新评估是否需要切换到纯 `html2canvas + jsPDF` 手动分页方案
