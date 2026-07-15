'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * PDF 导出 hook — 直接调当前页 window.print()，由 globals.css 里的 @media print
 * 规则负责隐藏 workbench 侧栏/工具栏。
 *
 * 分页策略（解决 Chrome 自动页眉页脚 + 多页边距一致 两个矛盾问题）：
 *   - @page margin:0 彻底消除 Chrome 自动页眉(日期/文件名)和页脚(URL/页码)的渲染空间
 *   - 导出前用 JS 把 #resume-preview 内容按 A4 高度切分到多个 .a4-page 容器,
 *     每个 .a4-page 自带 padding:40px,保证所有页面上下左右留白一致
 *   - afterprint 后恢复原始 DOM
 *
 * 准备顺序（解决打印态与屏幕态不一致的几个常见坑）：
 *   1. 等待 document.fonts.ready —— 否则中文 fallback 字体在打印时撑高/缩短
 *   2. img.decode() —— complete+naturalHeight 对 base64 不可靠，decode 真正解码
 *   3. document.title 改为 "{title}-YYYY-MM-DD.pdf"，Chrome 系统对话框会读取
 *   4. afterprint 触发后恢复 title —— 不能在 print() 后立即恢复，Chrome 可能在
 *      同步代码里就读取 title 作默认文件名（"另存为 PDF"场景）
 */
export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const handleAfterPrint = () => setIsExporting(false)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  const exportToPdf = useCallback(async (resumeTitle?: string) => {
    const sourceEl = document.getElementById('resume-preview')
    if (!sourceEl) throw new Error('找不到导出元素 #resume-preview')

    // 1) 等字体加载完。中文 fallback 链（PingFang / 微软雅黑）在不同 OS 上宽度不同，
    //    必须在 print 前就加载完，否则 Chrome 打印引擎会用 fallback 字体撑高/缩短内容。
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready
      } catch {
        // 字体加载失败不阻断导出
      }
    }

    // 2) 等所有图片解码完。complete+naturalHeight 对 base64 图片不可靠（某些浏览器
    //    complete=true 时 naturalHeight 还是 0），decode() 是 W3C 标准 API，真正等到
    //    图片可绘制后再继续。
    const images = Array.from(sourceEl.querySelectorAll('img'))
    await Promise.all(
      images.map(async (img) => {
        if (img.complete && img.naturalWidth > 0) return
        try {
          await img.decode()
        } catch {
          // 图片解码失败也继续，避免阻塞导出
        }
      })
    )

    // 3) 改 document.title → Chrome 系统打印对话框"另存为 PDF"会读这个作为默认文件名。
    const originalTitle = document.title
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    const safeTitle = (resumeTitle || '').trim() || '简历'
    document.title = `${safeTitle}-${dateStr}`

    // 4) 注册一次性 afterprint 恢复 title + DOM。不能在 print() 后立即同步恢复 ——
    //    Chrome 打印对话框是同步阻塞的,print() 返回时打印流程可能还没完成,
    //    同步清理会导致 PDF 内容被破坏。afterprint 是打印完全结束后的可靠时机。
    let restored = false
    const restoreTitle = () => {
      if (restored) return
      restored = true
      document.title = originalTitle
      window.removeEventListener('afterprint', restoreTitle)
    }
    window.addEventListener('afterprint', restoreTitle)

    // 5) JS 分页:把 .resume-pages 内容按 A4 高度切分到多个 .a4-page 容器。
    //    A4 = 297mm,每页 padding 40px(上下各 40),可用内容高度 = 297mm - 80px。
    //    用 px 计算:A4 @96dpi = 1123px,padding 上下各 40px → 可用 1043px。
    const cleanup = paginateForPrint(sourceEl)

    // 6) afterprint 时恢复 DOM(与 title 恢复复用同一时机)
    const cleanupOnAfterPrint = () => {
      cleanup()
      window.removeEventListener('afterprint', cleanupOnAfterPrint)
    }
    window.addEventListener('afterprint', cleanupOnAfterPrint)

    setIsExporting(true)
    try {
      window.print()
    } catch (e) {
      restoreTitle()
      cleanup()
      window.removeEventListener('afterprint', cleanupOnAfterPrint)
      throw e
    }
    // 注意:不在 finally 里 cleanup —— window.print() 同步返回时打印可能未完成,
    //       必须等 afterprint 事件触发后才恢复 DOM。
  }, [])

  return { isExporting, exportToPdf }
}

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
 *   - 逐个单元装入当前页,测量高度 = getBoundingClientRect().height + marginTop + marginBottom
 *     (必须包含 margin!只算 height 会忽略元素间距,导致装箱时认为能装下,
 *      实际渲染时 margin 累加溢出页面,出现"第一页底部撑高、留白不一致"问题。
 *      略微保守但不溢出,相邻 margin 折叠会让高估的值在渲染时被吸收)
 *   - 装不下时新建一页,把当前单元推到新页
 *   - 标题孤儿控制:如果当前单元是 <h2>,装入后预判下一个单元是否装得下
 *     当前页剩余空间;若装不下,把标题也一起推到下一页(避免标题孤立在页底)
 */
export function packIntoPages(units: HTMLElement[], pageContentHeightPx: number): HTMLElement[][] {
  if (units.length === 0) return []

  // 测量单元的"占位高度" = rect.height + 上下 margin。
  // 用 getBoundingClientRect + computedStyle.margin,而非 offsetHeight(offsetHeight 不含 margin)。
  const measureHeight = (el: HTMLElement): number => {
    const rect = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    const marginTop = parseFloat(style.marginTop) || 0
    const marginBottom = parseFloat(style.marginBottom) || 0
    return rect.height + marginTop + marginBottom
  }

  const pages: HTMLElement[][] = []
  let currentPage: HTMLElement[] = []
  let currentHeight = 0

  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    const unitHeight = measureHeight(unit)

    // 当前页已有内容且装不下当前单元 → 开新页
    if (currentPage.length > 0 && currentHeight + unitHeight > pageContentHeightPx) {
      pages.push(currentPage)
      currentPage = []
      currentHeight = 0
    }

    // 装入当前单元
    currentPage.push(unit)
    currentHeight += unitHeight

    // 标题孤儿控制:h2 装入后,若下一个单元放不下当前页剩余空间,
    // 把 h2 从当前页移除并推到下一页(与后续内容同页)
    if (unit.tagName === 'H2' && i + 1 < units.length) {
      const nextHeight = measureHeight(units[i + 1])
      if (currentHeight + nextHeight > pageContentHeightPx) {
        currentPage.pop()
        currentHeight -= unitHeight
        if (currentPage.length > 0) {
          pages.push(currentPage)
        }
        currentPage = [unit]
        currentHeight = unitHeight
      }
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage)
  }

  return pages
}

/**
 * 把 #resume-preview (.resume-pages) 内容按 A4 高度切分到多个 .a4-page 容器。
 *
 * 流式分页策略(最小颗粒度 = DOM 段落):
 *   - 遍历每个 .resume-section,用 collectFlowUnits 收集叶子块级流动单元
 *     (每个 <p>/<li>/结构性行 作为独立单元,而非整 section 装箱)
 *   - 用 packIntoPages 按可用高度装箱,装不下时推到下一页
 *   - 创建 .a4-page 容器,把分好页的单元移入
 *   - afterprint 时从深克隆恢复原始 DOM
 *
 * 相比旧版"整 section 装箱",避免 section 装不下当前页时整体推到下一页
 * 造成的大面积底部留白。
 */
function paginateForPrint(sourceEl: HTMLElement): () => void {
  const PAGE_CONTENT_HEIGHT_PX = 1123 - 80 // A4 高 1123px - 上下 padding 各 40px

  // 保存原始内联样式,清理时恢复
  const originalDisplay = sourceEl.style.display
  const originalFlexDirection = sourceEl.style.flexDirection
  const originalGap = sourceEl.style.gap

  // 深克隆原始 DOM,清理时恢复(单元会被移动到 .a4-page,原结构会被破坏)
  const originalClone = sourceEl.cloneNode(true) as HTMLElement

  // 临时改为 block 布局 + 无 gap,让 .a4-page 子元素自然堆叠,测量准确
  sourceEl.style.display = 'block'
  sourceEl.style.flexDirection = ''
  sourceEl.style.gap = '0'

  // 收集所有 .resume-section 的流动单元(此时单元仍在原 DOM 中,可被 getBoundingClientRect 测量)
  const sections = Array.from(sourceEl.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && c.classList.contains('resume-section'),
  )
  const allUnits: HTMLElement[] = []
  for (const section of sections) {
    allUnits.push(...collectFlowUnits(section))
  }

  // 按可用高度装箱分页
  const pages = packIntoPages(allUnits, PAGE_CONTENT_HEIGHT_PX)

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
    sourceEl.style.display = originalDisplay
    sourceEl.style.flexDirection = originalFlexDirection
    sourceEl.style.gap = originalGap
  }
}

function createA4Page(): HTMLElement {
  const page = document.createElement('div')
  // 同时带 a4-page 和 rich-content 两个 class:
  //   - a4-page:打印态 CSS 提供固定 A4 尺寸 + 40px padding + page-break-after
  //   - rich-content:让原 .rich-content 内的列表/段落样式(ul li::before 圆点、
  //     ol li::before 序号、p margin 等)在 .a4-page 内继续生效,保证打印与预览一致
  page.className = 'a4-page rich-content'
  // 内联设置尺寸和 padding,确保屏幕态测量高度时也与打印态一致
  // (打印态的 .a4-page CSS 规则与此一致,内联样式优先级更高但值相同,无冲突)
  page.style.width = '210mm'
  page.style.minHeight = '297mm'
  page.style.padding = '40px'
  page.style.boxSizing = 'border-box'
  return page
}
