import '@testing-library/jest-dom'

class StorageMock implements Storage {
  private store: Record<string, string> = {}
  get length(): number { return Object.keys(this.store).length }
  clear(): void { this.store = {} }
  getItem(key: string): string | null { return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key]! : null }
  key(index: number): string | null { const keys = Object.keys(this.store); return index >= 0 && index < keys.length ? keys[index]! : null }
  removeItem(key: string): void { delete this.store[key] }
  setItem(key: string, value: string): void { this.store[key] = String(value) }
}

type GlobalWithStorages = typeof globalThis & { localStorage?: Storage; sessionStorage?: Storage }
const g = globalThis as GlobalWithStorages
if (!g.localStorage) g.localStorage = new StorageMock()
if (!g.sessionStorage) g.sessionStorage = new StorageMock()

if (!globalThis.matchMedia) {
  globalThis.matchMedia = (query: string): MediaQueryList => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin = '0px'
  readonly thresholds: ReadonlyArray<number> = []
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
}
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = MockIntersectionObserver
}

class MockResizeObserver implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = MockResizeObserver
}
