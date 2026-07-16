import { describe, it, expect } from 'vitest'
import { collectFlowUnits, packIntoPages } from '@/lib/pagination'

/**
 * PDF 分页算法单元测试。
 *
 * 被测函数:
 *   - collectFlowUnits:收集 section 内的叶子块级流动单元
 *   - packIntoPages:按可用高度装箱分页
 *
 * 注意:jsdom 的 getBoundingClientRect 默认返回全 0,需要手动 mock 高度。
 */

/**
 * 给元素设置 mock 的 getBoundingClientRect,返回指定 height。
 * jsdom 不会真正布局,getBoundingClientRect 总是返回 0,
 * 装箱算法依赖该值,所以必须 mock。
 */
function setMockHeight(el: HTMLElement, height: number) {
  Object.defineProperty(el, 'getBoundingClientRect', {
    value: () => ({
      height,
      width: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
    configurable: true,
  })
}

/**
 * 从 HTML 字符串构造一个独立的 section 容器。
 * collectFlowUnits 接受的 section 参数是 .resume-section 的直接子 <section>,
 * 但函数内部会从传入的节点开始向下查找,所以直接传 .resume-section 也能工作。
 */
function buildSection(html: string): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  // 返回 .resume-section 节点本身(函数从该节点向下遍历)
  return wrapper.querySelector('.resume-section') as HTMLElement
}

describe('collectFlowUnits - 收集叶子块级流动单元', () => {
  it('列表型 section(experience 结构):按顺序收集标题、结构性行、rich-content 块级子元素,<ul> 拆分为单个 <li>', () => {
    // 构造 experience 风格的 section:
    //   - <h2> 标题
    //   - entry div 内含 display:flex 公司行、职位行 div、.rich-content 富文本
    //   - .rich-content 含 <p> 段落 + <ul> 列表(列表拆分为单个 <li> 流动单元)
    const section = buildSection(`
      <div class="resume-section">
        <section>
          <h2>工作经验</h2>
          <div>
            <div>
              <div style="display:flex">公司A | 2020-2022</div>
              <div>前端工程师</div>
              <div class="rich-content">
                <p>描述段落1</p>
                <p>描述段落2</p>
                <ul><li>任务1</li><li>任务2</li></ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    `)

    const units = collectFlowUnits(section)

    // 期望顺序:
    //   1. <h2> 标题
    //   2. display:flex 公司行 div
    //   3. 职位行 div
    //   4. <p> 描述段落1
    //   5. <p> 描述段落2
    //   6. <ul> wrapper(含任务1)<ul> 被拆分为单个 <li>,每个 <li> 包在 <ul> wrapper 里
    //      保持 CSS 选择器链(.rich-content ul li::before 渲染圆点),避免打印时圆点消失
    //   7. <ul> wrapper(含任务2)
    expect(units).toHaveLength(7)
    expect(units[0]!.tagName).toBe('H2')
    expect(units[0]!.textContent).toBe('工作经验')

    expect(units[1]!.tagName).toBe('DIV')
    expect(units[1]!.style.display).toBe('flex')
    expect(units[1]!.textContent).toContain('公司A')

    expect(units[2]!.tagName).toBe('DIV')
    expect(units[2]!.textContent).toBe('前端工程师')

    expect(units[3]!.tagName).toBe('P')
    expect(units[3]!.textContent).toBe('描述段落1')

    expect(units[4]!.tagName).toBe('P')
    expect(units[4]!.textContent).toBe('描述段落2')

    // 每个 <li> 包在 <ul> wrapper 里(保持 CSS 选择器链)
    expect(units[5]!.tagName).toBe('UL')
    expect(units[5]!.textContent).toBe('任务1')
    expect(units[5]!.querySelector('li')!.textContent).toBe('任务1')

    expect(units[6]!.tagName).toBe('UL')
    expect(units[6]!.textContent).toBe('任务2')
    expect(units[6]!.querySelector('li')!.textContent).toBe('任务2')
  })

  it('富文本型 section(selfEvaluation 结构):收集标题 + rich-content 的块级子元素', () => {
    const section = buildSection(`
      <div class="resume-section">
        <section>
          <h2>自我评价</h2>
          <div class="rich-content">
            <p>段落1</p>
            <p>段落2</p>
            <blockquote>引用</blockquote>
          </div>
        </section>
      </div>
    `)

    const units = collectFlowUnits(section)

    // <blockquote> 内无 <p>(裸文本),整体作为单元
    expect(units).toHaveLength(4)
    expect(units[0]!.tagName).toBe('H2')
    expect(units[1]!.tagName).toBe('P')
    expect(units[1]!.textContent).toBe('段落1')
    expect(units[2]!.tagName).toBe('P')
    expect(units[2]!.textContent).toBe('段落2')
    expect(units[3]!.tagName).toBe('BLOCKQUOTE')
    expect(units[3]!.textContent).toBe('引用')
  })

  it('blockquote 含多个 <p>:拆分为内部 <p> 作为独立流动单元', () => {
    // TipTap 标准结构:blockquote 内部是 <p>(每行一段),
    // 拆分为单个 <p> 流动单元避免长引用块整块被推到下一页。
    const section = buildSection(`
      <div class="resume-section">
        <section>
          <h2>引用</h2>
          <div class="rich-content">
            <blockquote>
              <p>引用段1</p>
              <p>引用段2</p>
              <p>引用段3</p>
            </blockquote>
          </div>
        </section>
      </div>
    `)

    const units = collectFlowUnits(section)

    expect(units).toHaveLength(4)
    expect(units[0]!.tagName).toBe('H2')
    expect(units[1]!.tagName).toBe('P')
    expect(units[1]!.textContent).toBe('引用段1')
    expect(units[2]!.tagName).toBe('P')
    expect(units[2]!.textContent).toBe('引用段2')
    expect(units[3]!.tagName).toBe('P')
    expect(units[3]!.textContent).toBe('引用段3')
  })

  it('未知块级元素(<pre>/<table>/<hr>/<div>):作为整体单元保留,避免内容丢失', () => {
    // 用户从外部粘贴带入的非 TipTap 标准结构,兜底保留为整体单元,
    // 避免内容在 PDF 中完全丢失。
    const section = buildSection(`
      <div class="resume-section">
        <section>
          <h2>混合内容</h2>
          <div class="rich-content">
            <p>段落</p>
            <pre><code>code block</code></pre>
            <table><tbody><tr><td>cell</td></tr></tbody></table>
            <hr />
            <div>自定义 div</div>
          </div>
        </section>
      </div>
    `)

    const units = collectFlowUnits(section)

    // 期望: h2 + p + pre + table + hr + div = 6 个单元
    expect(units).toHaveLength(6)
    expect(units[0]!.tagName).toBe('H2')
    expect(units[1]!.tagName).toBe('P')
    expect(units[2]!.tagName).toBe('PRE')
    expect(units[3]!.tagName).toBe('TABLE')
    expect(units[4]!.tagName).toBe('HR')
    expect(units[5]!.tagName).toBe('DIV')
  })

  it('嵌套列表:作为整体单元保留(不扁平化,避免破坏视觉层级)', () => {
    // TipTap 嵌套列表默认渲染:
    //   <ul>
    //     <li>父级1
    //       <ul><li>子级1.1</li><li>子级1.2</li></ul>
    //     </li>
    //     <li>父级2</li>
    //   </ul>
    //
    // 处理:外层 <ul> 拆分为单个 <li>(每个包在 <ul> wrapper 里),
    //   含嵌套 <ul> 的 <li> 作为整体单元保留(不递归扁平化)。
    //   原因:递归扁平化会破坏嵌套视觉层级,且嵌套列表在简历场景极少用,
    //   整体作为单元的影响可接受。
    const section = buildSection(`
      <div class="resume-section">
        <section>
          <h2>嵌套列表</h2>
          <div class="rich-content">
            <ul>
              <li>父级1<ul><li>子级1.1</li><li>子级1.2</li></ul></li>
              <li>父级2</li>
            </ul>
          </div>
        </section>
      </div>
    `)

    const units = collectFlowUnits(section)

    // 期望: h2 + 父级1(含嵌套 <ul>,整体) + 父级2 = 3 个单元
    expect(units).toHaveLength(3)
    expect(units[0]!.tagName).toBe('H2')

    // 父级1 包在 <ul> wrapper 里,含嵌套 <ul>(未拆分)
    expect(units[1]!.tagName).toBe('UL')
    expect(units[1]!.textContent).toBe('父级1子级1.1子级1.2')
    expect(units[1]!.querySelector('li > ul')).not.toBeNull()

    // 父级2 包在 <ul> wrapper 里
    expect(units[2]!.tagName).toBe('UL')
    expect(units[2]!.textContent).toBe('父级2')
  })

  it('空 section:仅含标题时只收集标题', () => {
    const section = buildSection(`
      <div class="resume-section">
        <section><h2>空</h2></section>
      </div>
    `)

    const units = collectFlowUnits(section)

    expect(units).toHaveLength(1)
    expect(units[0]!.tagName).toBe('H2')
    expect(units[0]!.textContent).toBe('空')
  })
})

describe('packIntoPages - 按高度装箱分页', () => {
  it('所有单元装得下单页:返回 1 页含全部单元', () => {
    // 3 个单元高度分别 100/200/300,总高 600 <= 1000,装得下单页
    const units = [100, 200, 300].map(h => {
      const el = document.createElement('div')
      setMockHeight(el, h)
      return el
    })

    const pages = packIntoPages(units, 1000)

    expect(pages).toHaveLength(1)
    expect(pages[0]).toHaveLength(3)
    expect(pages[0]).toEqual(units)
  })

  it('单元总高超过一页:按高度逐页装箱', () => {
    // 5 个单元各 400,pageHeight=1000:
    //   - page1: 400+400=800,第三个 400 会超 → [u1, u2]
    //   - page2: 400+400=800,第五个 400 会超 → [u3, u4]
    //   - page3: [u5]
    const units = [400, 400, 400, 400, 400].map(h => {
      const el = document.createElement('div')
      setMockHeight(el, h)
      return el
    })

    const pages = packIntoPages(units, 1000)

    expect(pages).toHaveLength(3)
    expect(pages[0]).toEqual([units[0], units[1]])
    expect(pages[1]).toEqual([units[2], units[3]])
    expect(pages[2]).toEqual([units[4]])
  })

  it('单段落高度超过页剩余空间时整体推到下一页', () => {
    // 2 个单元各 800,pageHeight=1000:
    //   - u1(800) 装入,currentHeight=800
    //   - u2(800): 800+800=1600>1000 且 currentPage 非空 → push [u1],开新页 [u2]
    const units = [800, 800].map(h => {
      const el = document.createElement('div')
      setMockHeight(el, h)
      return el
    })

    const pages = packIntoPages(units, 1000)

    expect(pages).toHaveLength(2)
    expect(pages[0]).toEqual([units[0]])
    expect(pages[1]).toEqual([units[1]])
  })

  it('标题孤儿控制:h2 装入后若下一个单元放不下,把 h2 推到下一页', () => {
    // [div(900), h2(100), div(500)], pageHeight=1000:
    //   - i=0: div(900), currentHeight=900
    //   - i=1: h2(100), 900+100=1000 不超过 → 装入,currentHeight=1000
    //          检查 next(div500): 1000+500>1000 → 孤儿触发,h2 移除,currentHeight=900
    //          currentPage=[div900] 非空 → push [div900],currentPage=[h2],currentHeight=100
    //   - i=2: div(500), 100+500=600 不超过 → 装入,currentHeight=600
    //   - 结束: push [h2, div500]
    //   期望: [[div900], [h2, div500]]
    const div900 = document.createElement('div')
    setMockHeight(div900, 900)
    const h2 = document.createElement('h2')
    setMockHeight(h2, 100)
    const div500 = document.createElement('div')
    setMockHeight(div500, 500)
    const units = [div900, h2, div500]

    const pages = packIntoPages(units, 1000)

    expect(pages).toHaveLength(2)
    expect(pages[0]).toEqual([div900])
    expect(pages[1]).toEqual([h2, div500])
  })

  it('多 section 混合:多个标题 + 内容单元混合装箱', () => {
    // [h2(50), div(300), h2(50), div(300), div(300), div(300)], pageHeight=700:
    //   - i=0: h2(50), currentHeight=50。next(div300): 50+300=350<=700 → 无孤儿
    //   - i=1: div(300), 350<=700, currentHeight=350
    //   - i=2: h2(50), 350+50=400<=700, currentHeight=400。next(div300): 400+300=700<=700 → 无孤儿
    //   - i=3: div(300), 700<=700, currentHeight=700
    //   - i=4: div(300), 700+300>700 且 currentPage 非空 → push [h2,div300,h2,div300],开新页 [div300],currentHeight=300
    //   - i=5: div(300), 300+300=600<=700, currentHeight=600
    //   - 结束: push [div300, div300]
    //   期望: [[h2,div300,h2,div300], [div300,div300]]
    const h2a = document.createElement('h2')
    setMockHeight(h2a, 50)
    const div300a = document.createElement('div')
    setMockHeight(div300a, 300)
    const h2b = document.createElement('h2')
    setMockHeight(h2b, 50)
    const div300b = document.createElement('div')
    setMockHeight(div300b, 300)
    const div300c = document.createElement('div')
    setMockHeight(div300c, 300)
    const div300d = document.createElement('div')
    setMockHeight(div300d, 300)
    const units = [h2a, div300a, h2b, div300b, div300c, div300d]

    const pages = packIntoPages(units, 700)

    expect(pages).toHaveLength(2)
    expect(pages[0]).toEqual([h2a, div300a, h2b, div300b])
    expect(pages[1]).toEqual([div300c, div300d])
  })

  it('空输入:返回空数组', () => {
    expect(packIntoPages([], 1000)).toEqual([])
  })
})
