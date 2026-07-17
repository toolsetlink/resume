import { afterEach, describe, expect, it, vi } from 'vitest'
import { paginateTemplate } from '@/lib/pagination'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

function measureAtoms(height = 500) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const template = this.closest('.resume-template')
    const atoms = template ? Array.from(template.querySelectorAll('[data-pagination-atom]')) : []
    const index = atoms.indexOf(this)
    const top = index < 0 ? 0 : index * height
    const elementHeight = index < 0 ? 1123 : height
    return { top, bottom: top + elementHeight, height: elementHeight } as DOMRect
  })
}

describe('paginateTemplate', () => {
  it('keeps each flow in its original column across pages', () => {
    measureAtoms(600)
    const template = document.createElement('div')
    template.className = 'resume-template'
    template.innerHTML = `
      <aside data-pagination-flow="sidebar"><div data-pagination-unit>技能</div><div data-pagination-unit>教育</div></aside>
      <main data-pagination-flow="main"><div data-pagination-unit>经历</div><div data-pagination-unit>项目</div></main>
    `
    document.body.appendChild(template)

    const pages = paginateTemplate(template)

    expect(pages).toHaveLength(2)
    expect(pages[0]?.querySelector('[data-pagination-flow="sidebar"]')?.textContent).toContain('技能')
    expect(pages[0]?.querySelector('[data-pagination-flow="main"]')?.textContent).toContain('经历')
    expect(pages[1]?.querySelector('[data-pagination-flow="sidebar"]')?.textContent).toContain('教育')
    expect(pages[1]?.querySelector('[data-pagination-flow="main"]')?.textContent).toContain('项目')
  })

  it('fills a page with paragraph units instead of moving the whole section', () => {
    measureAtoms()
    const template = document.createElement('div')
    template.className = 'resume-template'
    template.innerHTML = `
      <main data-pagination-flow="main">
        <div data-pagination-unit>
          <section>
            <h2>工作经历</h2>
            <div class="rich-content"><p>第一段</p><p>第二段</p><p>第三段</p></div>
          </section>
        </div>
      </main>
    `
    document.body.appendChild(template)

    const pages = paginateTemplate(template)

    expect(pages).toHaveLength(2)
    expect(pages[0]?.textContent?.replace(/\s/g, '')).toContain('工作经历第一段')
    expect(pages[0]?.textContent).not.toContain('第二段')
    expect(pages[1]?.textContent?.replace(/\s/g, '')).toContain('第二段第三段')
    expect(pages[1]?.textContent).not.toContain('工作经历')
  })

  it('keeps list items inside their list wrapper when a section spans pages', () => {
    measureAtoms(600)
    const template = document.createElement('div')
    template.className = 'resume-template'
    template.innerHTML = `
      <main data-pagination-flow="main">
        <div data-pagination-unit><section><h2>技能</h2><div class="rich-content"><ul><li>一</li><li>二</li></ul></div></section></div>
      </main>
    `
    document.body.appendChild(template)

    const pages = paginateTemplate(template)

    expect(pages).toHaveLength(2)
    expect(pages[1]?.querySelector('ul > li')?.textContent).toBe('二')
  })

  it('preserves all descendants inside a selected entry unit', () => {
    measureAtoms(600)
    const template = document.createElement('div')
    template.className = 'resume-template'
    template.innerHTML = `
      <main data-pagination-flow="main">
        <div data-pagination-unit><div><span>张三</span><span>前端工程师</span></div></div>
        <div data-pagination-unit>
          <section>
            <h2><span></span><span>工作经历</span></h2>
            <div><div style="display:flex"><span>某科技公司</span><span>2024 - 至今</span></div></div>
          </section>
        </div>
      </main>
    `
    document.body.appendChild(template)

    const pages = paginateTemplate(template)

    expect(pages).toHaveLength(2)
    expect(pages[0]?.textContent).toContain('张三前端工程师')
    expect(pages[1]?.textContent).toContain('工作经历')
    expect(pages[1]?.textContent).toContain('某科技公司')
    expect(pages[1]?.textContent).toContain('2024 - 至今')
  })
})
