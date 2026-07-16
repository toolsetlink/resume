/**
 * 简历分页核心算法 —— 屏幕态预览与 PDF 打印共用同一份逻辑。
 *
 * 历史:这套逻辑原本只服务于 usePdfExport 在打印前改写 DOM,屏幕态只有一个
 * 撑高的 .resume-pages 容器,看不到分页。
 * 现在屏幕态也要分页(让用户编辑时直接看到 A4 页边界),所以抽到独立模块,
 * 屏幕态(PaginatedResumePreview)和打印态(usePdfExport)用同一份算法 = 屏幕/PDF 完全一致。
 */

/** A4 纸 @96dpi 高度 = 297mm = 1123px,每页 padding 上下各 40px → 可用 1043px */
export const A4_HEIGHT_PX = 1123
export const A4_PADDING_PX = 40
export const A4_PAGE_CONTENT_HEIGHT_PX = A4_HEIGHT_PX - A4_PADDING_PX * 2

/**
 * 收集一个 .resume-section 内的叶子块级"流动单元"。
 *
 * 流动单元 = 分页最小颗粒度,不再向下拆分。三种类型:
 *   1. section 标题:SectionTitle 渲染的 <h2>
 *   2. entry 的结构性子元素:entry 内部非 rich-content 的直接子 div
 *      (如"公司名+日期行" flex div、"职位行"div、"GPA行"div、<a> 链接等)
 *   3. 富文本内的块级子元素:.rich-content 下的 <p>/<li>/<ul>/<ol>/
 *      <blockquote>/<h1>/<h2>/<h3>
 *
 * 特殊处理:BaseInfo 没有 <h2>(用 <h1> 渲染姓名),其整体视为一个流动单元,
 * 不做内部拆分 —— 联系方式是 inline flex 列表,拆分会破坏布局。
 */
export function collectFlowUnits(section: HTMLElement): HTMLElement[] {
  const units: HTMLElement[] = []
  const BLOCK_TAGS = new Set(['P', 'LI', 'UL', 'OL', 'BLOCKQUOTE', 'H1', 'H2', 'H3'])

  // BaseInfo 等无标题 section:整体作为单个流动单元,不拆分
  if (!section.querySelector('h2')) {
    Array.from(section.children).forEach(child => {
      units.push(child as HTMLElement)
    })
    return units
  }

  // 收集 .rich-content 下的块级子元素作为流动单元。
  // 容器标签(UL/OL/BLOCKQUOTE)整体作为一个单元会导致内部子元素无法单独流动:
  //   - <ul>/<ol>:列表内所有 <li> 被一起推到下一页(专业技能整块挤到第二页问题)
  //   - <blockquote>:引用块内所有 <p> 被一起推到下一页
  // 因此遇到容器标签时拆分为内部子元素作为独立流动单元。
  // 未知块级元素(<pre>/<table>/<hr>/<div> 等,多由粘贴带入)作为整体单元加入,
  // 避免内容在 PDF 中完全丢失。
  function collectRichContent(rc: HTMLElement) {
    Array.from(rc.children).forEach(child => {
      const el = child as HTMLElement
      if (el.tagName === 'UL' || el.tagName === 'OL') {
        // 列表 → 拆分为单个 <li> 流动单元。
        // 重要:每个 <li> 必须包在 <ul>/<ol> wrapper 里才能保持 CSS 选择器链
        // (.rich-content ul li::before 渲染圆点/序号),否则被移到 .a4-page 后
        // 会脱离 <ul> 父节点,圆点/序号全部消失,与预览页不一致。
        // wrapper 需先插入原 DOM(在 <ul> 之后),getBoundingClientRect 才能正确测量。
        const wrapperTag = el.tagName // UL 或 OL
        Array.from(el.children).forEach(li => {
          if (li.tagName !== 'LI') return
          const wrapper = document.createElement(wrapperTag)
          wrapper.appendChild(li) // 把 <li> 从原 <ul> 移到 wrapper
          el.after(wrapper)        // wrapper 插入原 DOM,可被正确测量
          units.push(wrapper)
        })
        // 原 <ul> 已空,从 DOM 移除(避免留在原位置干扰)
        el.remove()
      } else if (el.tagName === 'BLOCKQUOTE') {
        // 引用块 → 拆分为内部 <p> 流动单元(与 <ul> 拆 <li> 同理,
        // 避免长引用块整块被推到下一页)。
        // 裸文本场景(非 TipTap 标准结构,可能由粘贴带入)→ 整体作为单元,避免内容丢失。
        const ps = Array.from(el.children).filter(c => (c as HTMLElement).tagName === 'P')
        if (ps.length > 0) {
          ps.forEach(p => units.push(p as HTMLElement))
        } else {
          units.push(el)
        }
      } else if (BLOCK_TAGS.has(child.tagName)) {
        units.push(el)
      } else if (el.tagName !== 'SPAN' && el.tagName !== 'BR' && el.tagName !== 'MARK' && el.tagName !== 'CODE') {
        // 兜底:未知块级元素(如 <pre>/<table>/<hr>/<div> 等,多由粘贴带入)
        // 作为整体单元加入,避免内容在 PDF 中完全丢失。
        // 排除 inline 元素(SPAN/BR/MARK/CODE),这些不应作为块级流动单元。
        units.push(el)
      }
    })
  }

  // 收集 entry div 的直接子元素:
  //   - .rich-content → 拆分为块级子元素
  //   - 其余(结构性 div / <a> 等) → 整体作为一个流动单元
  function collectEntry(entry: HTMLElement) {
    Array.from(entry.children).forEach(child => {
      const el = child as HTMLElement
      if (el.classList.contains('rich-content')) {
        collectRichContent(el)
      } else {
        units.push(el)
      }
    })
  }

  // 判断一个 div 是否是 entry(包含结构性子元素如 flex 行 / rich-content / <a>),
  // 还是包裹容器(包含其他 div / <section> / <h2>)。
  // entry 的子元素里有 display:flex 的行、.rich-content、或 <a> 链接。
  function looksLikeEntry(el: HTMLElement): boolean {
    return Array.from(el.children).some(c => {
      const ce = c as HTMLElement
      return (
        ce.classList.contains('rich-content') ||
        ce.tagName === 'A' ||
        (ce.tagName === 'DIV' && ce.style.display === 'flex')
      )
    })
  }

  // 递归遍历容器节点,按规则收集流动单元
  function walkContainer(node: HTMLElement) {
    Array.from(node.children).forEach(child => {
      const el = child as HTMLElement
      if (el.tagName === 'H2') {
        // section 标题 → 流动单元
        units.push(el)
      } else if (el.classList.contains('rich-content')) {
        // 富文本型 section(技能/自我评价/证书)的 rich-content
        collectRichContent(el)
      } else if (el.tagName === 'SECTION') {
        // <section> 包裹层(Experience/Education/Project/Skill/...)→ 递归
        walkContainer(el)
      } else if (el.tagName === 'DIV') {
        if (looksLikeEntry(el)) {
          // entry div → 收集其结构性子元素
          collectEntry(el)
        } else {
          // 包裹容器(entries 列表 div / Custom section 分类 div)→ 递归
          walkContainer(el)
        }
      } else {
        // 其他元素(<a> 等)→ 作为流动单元
        units.push(el)
      }
    })
  }

  walkContainer(section)
  return units
}

/**
 * 把流动单元按可用高度装箱分页(纯逻辑,不操作 DOM 结构,只读取高度)。
 *
 * 算法:
 *   - 逐个单元装入当前页,占位高度 = getBoundingClientRect().height + flex 间距
 *     其中 flex 间距 = max(当前单元 marginTop, 上一单元 marginBottom)。
 *     flex column 布局里相邻 margin 不叠加(取较大),不能简单加 mt + mb,否则
 *     currentHeight 虚高,后续本来能装下的单元被推到下一页,页底留大块空白。
 *   - 装不下时新建一页,把当前单元推到新页
 *   - 标题孤儿控制:如果当前单元是 <h2>,装入后预判下一个单元是否装得下
 *     当前页剩余空间;若装不下,把标题也一起推到下一页(避免标题孤立在页底)
 */
export function packIntoPages(units: HTMLElement[], pageContentHeightPx: number): HTMLElement[][] {
  if (units.length === 0) return []

  // flex column 下相邻 unit 的视觉间距 = max(prevMb, curMt),
  // 不是 mt + mb(那是 block 布局相邻 margin 折叠前的值,flex 不折叠)。
  // 所以 unit 真正"占用"的栈高度 = rect.height + 该间距。
  const measureStackContribution = (el: HTMLElement, prevMarginBottom: number): number => {
    const rect = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    const marginTop = parseFloat(style.marginTop) || 0
    const gap = Math.max(prevMarginBottom, marginTop)
    return rect.height + gap
  }

  const pages: HTMLElement[][] = []
  let currentPage: HTMLElement[] = []
  let currentHeight = 0
  let currentMarginBottom = 0

  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    const unitHeight = measureStackContribution(unit, currentMarginBottom)

    // 当前页已有内容且装不下当前单元 → 开新页
    if (currentPage.length > 0 && currentHeight + unitHeight > pageContentHeightPx) {
      pages.push(currentPage)
      currentPage = []
      currentHeight = 0
      currentMarginBottom = 0
    }

    // 装入当前单元
    currentPage.push(unit)
    currentHeight += unitHeight

    // 标题孤儿控制:h2 装入后,若下一个单元放不下当前页剩余空间,
    // 把 h2 从当前页移除并推到下一页(与后续内容同页)。
    if (unit.tagName === 'H2' && i + 1 < units.length) {
      const unitMb = parseFloat(getComputedStyle(unit).marginBottom) || 0
      const nextHeight = measureStackContribution(units[i + 1], unitMb)
      if (currentHeight + nextHeight > pageContentHeightPx) {
        currentPage.pop()
        currentHeight -= unitHeight
        if (currentPage.length > 0) {
          pages.push(currentPage)
        }
        currentPage = [unit]
        currentHeight = unitHeight
        currentMarginBottom = unitMb
        continue
      }
    }

    currentMarginBottom = parseFloat(getComputedStyle(unit).marginBottom) || 0
  }

  if (currentPage.length > 0) {
    pages.push(currentPage)
  }

  return pages
}

/**
 * 创建一个 A4 页容器。
 *
 * 同时带 a4-page 和 rich-content 两个 class:
 *   - a4-page:屏幕态 + 打印态共用基类(min-height: 297mm,屏幕和 PDF 都是完整 A4)
 *   - rich-content:让原 .rich-content 内的列表/段落样式(ul li::before 圆点、
 *     ol li::before 序号、p margin 等)在 .a4-page 内继续生效,保证打印与预览一致
 *
 * 屏幕态:globals.css 基类已经把 min-height: 297mm 设上,卡片始终是完整 A4 纸。
 * 打印态:同样基于该基类 + @media print 关阴影。屏幕和 PDF 完全 1:1。
 */
export function createA4Page(): HTMLElement {
  const page = document.createElement('div')
  page.className = 'a4-page rich-content'
  page.style.width = '210mm'
  page.style.padding = '40px'
  page.style.boxSizing = 'border-box'
  return page
}

/**
 * 把 #resume-preview (.resume-pages) 内容按 A4 高度切分到多个 .a4-page 容器。
 *
 * 流式分页策略(最小颗粒度 = DOM 段落):
 *   - 遍历每个 .resume-section,用 collectFlowUnits 收集叶子块级流动单元
 *     (每个 <p>/<li>/结构性行 作为独立单元,而非整 section 装箱)
 *   - 用 packIntoPages 按可用高度装箱,装不下时推到下一页
 *   - 创建 .a4-page 容器,把分好页的单元移入
 *
 * 屏幕态调用:源容器被改写为多个 .a4-page 卡片;React 在数据变更时重新渲染,
 *   新 DOM 重新跑一次分页 → 屏幕看到的卡片堆叠就是打印会输出的页。
 * 打印态调用:不传 deepClone 但用 cleanup 恢复源(打印完 afterprint 后)。
 *
 * 布局策略:
 *   - 不覆盖 display/flexDirection/gap,让 CSS 接管:
 *       屏幕态:globals.css 里 .resume-pages 是 flex column + align-items center +
 *         gap 24px → 卡片垂直堆叠、居中、有间距
 *       打印态:@media print 把 .resume-pages 改回 block + gap 0 → 卡片紧贴
 *   - 清掉 templateContainerStyle 注入在 .resume-pages 上的 padding/backgroundColor/gap:
 *     这些属性原本是给"单一 .resume-pages 纸面"用的,分页后属于 .a4-page;
 *     留在 .resume-pages 上会造成双重 padding、模板背景色从卡片背后透出、
 *     itemGap 当成卡片间距而非 section 间距 → "卡片与画布错位"。
 *
 * 参数:
 *   - sourceEl: .resume-pages 容器(包含若干 .resume-section 子节点)
 * 返回:
 *   - cleanup: 恢复 sourceEl 到原始 DOM 的函数;屏幕态可忽略,打印态在 afterprint 调用
 */
export function paginateIntoA4Pages(sourceEl: HTMLElement): () => void {
  // 幂等性保护:如果 DOM 已经是分页状态(没有 .resume-section 子节点),
  // 不要再跑一次 —— 否则会清空现有 .a4-page 卡片后,因找不到源数据重建为空。
  // 这种情况发生在 usePdfExport 的"防御式"重分页调用:屏幕态已经分页过了。
  if (!sourceEl.querySelector('.resume-section')) {
    return () => {}
  }

  // 保存原始内联样式,清理时恢复
  const originalPadding = sourceEl.style.padding
  const originalBackgroundColor = sourceEl.style.backgroundColor
  const originalGap = sourceEl.style.gap

  // 深克隆原始 DOM,清理时恢复(单元会被移动到 .a4-page,原结构会被破坏)
  const originalClone = sourceEl.cloneNode(true) as HTMLElement

  // 清掉只属于"单一纸面"的内联样式 —— 这些属性分页后由 .a4-page 自己承担,
  // 留在 .resume-pages 上会造成视觉错位。display/flex/gap 由 CSS 接管。
  sourceEl.style.padding = ''
  sourceEl.style.backgroundColor = ''
  sourceEl.style.gap = ''

  // 收集所有 .resume-section 的流动单元(此时单元仍在原 DOM 中,可被 getBoundingClientRect 测量)
  const sections = Array.from(sourceEl.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && c.classList.contains('resume-section'),
  )
  const allUnits: HTMLElement[] = []
  for (const section of sections) {
    allUnits.push(...collectFlowUnits(section))
  }

  // 按可用高度装箱分页
  const pages = packIntoPages(allUnits, A4_PAGE_CONTENT_HEIGHT_PX)

  // 清空原容器,用 .a4-page 容器重排(单元从原 DOM 移动到 .a4-page)
  sourceEl.textContent = ''
  for (const pageUnits of pages) {
    const page = createA4Page()
    for (const unit of pageUnits) {
      page.appendChild(unit)
    }
    sourceEl.appendChild(page)
  }

  // 清理:从深克隆恢复原始 DOM 和内联样式
  return () => {
    sourceEl.textContent = ''
    Array.from(originalClone.childNodes).forEach(node => {
      sourceEl.appendChild(node.cloneNode(true))
    })
    sourceEl.style.padding = originalPadding
    sourceEl.style.backgroundColor = originalBackgroundColor
    sourceEl.style.gap = originalGap
  }
}