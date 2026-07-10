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

if (!globalThis.localStorage) { (globalThis as any).localStorage = new StorageMock() }
if (!globalThis.sessionStorage) { (globalThis as any).sessionStorage = new StorageMock() }

if (!globalThis.matchMedia) {
  globalThis.matchMedia = (query: string): MediaQueryList => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} takeRecords(){ return [] } } as any
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} } as any
}
