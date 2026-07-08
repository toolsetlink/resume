// Vitest 全局 setup 文件
// 为 happy-dom 环境补齐浏览器 API 与全局 mock

// ============================================================
// 1. localStorage / sessionStorage mock
// happy-dom 默认不提供完整的 localStorage 实现，
// pinia-plugin-persistedstate 依赖 localStorage 做持久化。
// ============================================================

class StorageMock implements Storage {
  private store: Record<string, string> = {}

  get length(): number {
    return Object.keys(this.store).length
  }

  clear(): void {
    this.store = {}
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key)
      ? this.store[key]!
      : null
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store)
    return index >= 0 && index < keys.length ? keys[index]! : null
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }
}

// 仅在当前全局不存在时注入，避免覆盖 happy-dom 已有实现
if (!globalThis.localStorage) {
  // @ts-expect-error 注入到全局
  globalThis.localStorage = new StorageMock()
}

if (!globalThis.sessionStorage) {
  // @ts-expect-error 注入到全局
  globalThis.sessionStorage = new StorageMock()
}

// ============================================================
// 2. matchMedia mock
// TDesign 在响应式断点检测时会调用 window.matchMedia。
// happy-dom 默认不实现该方法，会导致组件渲染时抛错。
// ============================================================

if (!globalThis.matchMedia) {
  globalThis.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // 已废弃，保留兼容
    removeListener: () => {}, // 已废弃，保留兼容
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// ============================================================
// 3. IntersectionObserver mock
// 部分组件（如懒加载、滚动监听）依赖 IntersectionObserver。
// ============================================================

if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class IntersectionObserver {
    readonly root: Element | null = null
    readonly rootMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = []
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

// ============================================================
// 5. ResizeObserver mock
// TDesign 部分组件会监听元素尺寸变化。
// ============================================================

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof ResizeObserver
}

// ============================================================
// 5. Nuxt 自动导入 composable mock：useI18n
// Nuxt 通过 unplugin-auto-import 在编译期注入 useI18n（来自 vue-i18n）。
// vitest 单独运行时不会触发该注入，需在全局提供默认实现。
// 既有测试可通过 vi.stubGlobal('useI18n', ...) 覆盖此默认实现。
// 注意：仅在尚未定义时注入，避免覆盖测试内的 stubGlobal 调用。
// ============================================================
if (!(globalThis as any).useI18n) {
  (globalThis as any).useI18n = () => ({
    t: (key: string) => key,
    locale: { value: 'zh-CN' },
  })
}
