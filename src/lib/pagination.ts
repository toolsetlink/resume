/** A4 纸 @96dpi 高度。 */
export const A4_HEIGHT_PX = 1123

const ATOM_ATTRIBUTE = 'data-pagination-atom'

function createA4Page() {
  const page = document.createElement('div')
  page.className = 'a4-page'
  return page
}

/**
 * 收集 section 内最小的语义分页单元。单元只整块换页，不拆文字行。
 */
function collectAtoms(section: HTMLElement): HTMLElement[] {
  const atoms: HTMLElement[] = []

  if (!section.querySelector('h2')) {
    const children = Array.from(section.children) as HTMLElement[]
    return children.length ? children : [section]
  }

  function collectRichContent(container: HTMLElement) {
    for (const child of Array.from(container.children) as HTMLElement[]) {
      if (child.matches('ul, ol')) {
        atoms.push(...Array.from(child.children).filter((item): item is HTMLElement => item instanceof HTMLElement && item.tagName === 'LI'))
      } else if (child.tagName === 'BLOCKQUOTE' && child.children.length) {
        atoms.push(...Array.from(child.children) as HTMLElement[])
      } else if (!child.matches('span, br, mark, code')) {
        atoms.push(child)
      }
    }
  }

  function isEntry(element: HTMLElement) {
    return Array.from(element.children).some((child) => {
      const item = child as HTMLElement
      return item.classList.contains('rich-content') || item.tagName === 'A' || (item.tagName === 'DIV' && item.style.display === 'flex')
    })
  }

  function walk(container: HTMLElement) {
    for (const child of Array.from(container.children) as HTMLElement[]) {
      if (child.tagName === 'H2') {
        atoms.push(child)
      } else if (child.classList.contains('rich-content')) {
        collectRichContent(child)
      } else if (child.tagName === 'DIV' && isEntry(child)) {
        for (const entryPart of Array.from(child.children) as HTMLElement[]) {
          if (entryPart.classList.contains('rich-content')) collectRichContent(entryPart)
          else atoms.push(entryPart)
        }
      } else if (child.matches('div, section')) {
        walk(child)
      } else {
        atoms.push(child)
      }
    }
  }

  walk(section)
  return atoms
}

function flowName(flow: HTMLElement) {
  return flow.dataset.paginationFlow || 'main'
}

function cloneTemplate(source: HTMLElement, selections: Map<string, Set<string>>) {
  const template = source.cloneNode(true) as HTMLElement

  function pruneBranch(branch: HTMLElement): boolean {
    if (branch.hasAttribute(ATOM_ATTRIBUTE)) return true
    let hasSelectedAtom = false
    for (const child of Array.from(branch.children) as HTMLElement[]) {
      if (pruneBranch(child)) hasSelectedAtom = true
      else child.remove()
    }
    return hasSelectedAtom
  }

  for (const flow of Array.from(template.querySelectorAll<HTMLElement>('[data-pagination-flow]'))) {
    const selected = selections.get(flowName(flow)) || new Set<string>()
    for (const atom of Array.from(flow.querySelectorAll<HTMLElement>(`[${ATOM_ATTRIBUTE}]`))) {
      if (!selected.has(atom.getAttribute(ATOM_ATTRIBUTE) || '')) atom.remove()
    }
    for (const section of Array.from(flow.children) as HTMLElement[]) {
      if (!section.hasAttribute('data-pagination-unit') || section.hasAttribute(ATOM_ATTRIBUTE)) continue
      if (!section.querySelector(`[${ATOM_ATTRIBUTE}]`)) {
        section.remove()
        continue
      }
      pruneBranch(section)
    }

    const remainingAtoms = Array.from(flow.querySelectorAll<HTMLElement>(`[${ATOM_ATTRIBUTE}]`))
    for (let element: HTMLElement | null | undefined = remainingAtoms.at(-1); element && element !== flow; element = element.parentElement) {
      element.style.marginBottom = '0'
    }
  }

  return template
}

function fitsOnPage(source: HTMLElement, name: string, keys: string[]) {
  const host = createA4Page()
  host.style.position = 'absolute'
  host.style.visibility = 'hidden'
  host.style.pointerEvents = 'none'
  host.appendChild(cloneTemplate(source, new Map([[name, new Set(keys)]])))
  source.parentElement?.appendChild(host)
  const content = host.firstElementChild as HTMLElement | null
  const contentTop = content?.getBoundingClientRect().top || 0
  const atoms = content ? Array.from(content.querySelectorAll<HTMLElement>(`[${ATOM_ATTRIBUTE}]`)) : []
  const contentBottom = atoms.reduce((bottom, atom) => {
    let bottomInset = 0
    for (let parent = atom.parentElement; parent && parent !== content; parent = parent.parentElement) {
      bottomInset = Math.max(bottomInset, parseFloat(getComputedStyle(parent).paddingBottom) || 0)
    }
    return Math.max(bottom, atom.getBoundingClientRect().bottom + bottomInset)
  }, contentTop)
  const fits = contentBottom <= contentTop + A4_HEIGHT_PX + 1 && (!content || content.scrollHeight <= A4_HEIGHT_PX + 1)
  host.remove()
  return fits
}

function packFlow(source: HTMLElement, flow: HTMLElement) {
  const atoms = Array.from(flow.children).flatMap((section) => collectAtoms(section as HTMLElement))
  atoms.forEach((atom, index) => atom.setAttribute(ATOM_ATTRIBUTE, `${flowName(flow)}-${index}`))

  const pages: string[][] = []
  let page: string[] = []

  for (const atom of atoms) {
    const key = atom.getAttribute(ATOM_ATTRIBUTE) || ''
    if (page.length && !fitsOnPage(source, flowName(flow), [...page, key])) {
      const previous = atoms.find((candidate) => candidate.getAttribute(ATOM_ATTRIBUTE) === page.at(-1))
      if (previous?.tagName === 'H2') {
        const title = page.pop()!
        if (page.length) pages.push(page)
        page = [title, key]
      } else {
        pages.push(page)
        page = [key]
      }
    } else {
      page.push(key)
    }
  }

  if (page.length) pages.push(page)
  return { name: flowName(flow), pages }
}

/**
 * 将标记为 data-pagination-flow / data-pagination-unit 的模板分页。
 * 每页克隆完整模板骨架，只替换内容流，双栏不会被扁平化。
 */
export function paginateTemplate(sourceTemplate: HTMLElement): HTMLElement[] {
  const sourceFlows = Array.from(sourceTemplate.querySelectorAll<HTMLElement>('[data-pagination-flow]'))
  const flows = sourceFlows.map((flow) => packFlow(sourceTemplate, flow))
  const pageCount = Math.max(1, ...flows.map((flow) => flow.pages.length))

  const pages = Array.from({ length: pageCount }, (_, pageIndex) => {
    const selections = new Map(flows.map((flow) => [flow.name, new Set(flow.pages[pageIndex] || [])]))
    const page = createA4Page()
    page.appendChild(cloneTemplate(sourceTemplate, selections))
    return page
  })

  sourceTemplate.querySelectorAll(`[${ATOM_ATTRIBUTE}]`).forEach((atom) => atom.removeAttribute(ATOM_ATTRIBUTE))
  pages.forEach((page) => page.querySelectorAll(`[${ATOM_ATTRIBUTE}]`).forEach((atom) => atom.removeAttribute(ATOM_ATTRIBUTE)))
  return pages
}
