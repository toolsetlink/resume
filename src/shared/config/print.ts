// A4 纸张尺寸与打印配置 - 自由简历项目
//
// 单位约定:
//   - CSS pixel (96 DPI) 用于屏幕/JS 计算：794×1123
//   - mm 用于 @page 与 @media print (210×297)
//   - 别在多处手写数字，统一从这里取

export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297

export const A4_WIDTH_PX = 794
export const A4_HEIGHT_PX = 1123

// 浏览器打印默认 DPI 不一定是 96；CSS @page size: A4 会按真实纸张渲染，
// 所以 JS 里用的 794×1123 仅作为屏幕侧 "页面盒子" 的参考尺寸。
export interface A4PageMetrics {
  readonly widthPx: number
  readonly heightPx: number
  readonly widthMm: number
  readonly heightMm: number
}

export const A4_METRICS: A4PageMetrics = {
  widthPx: A4_WIDTH_PX,
  heightPx: A4_HEIGHT_PX,
  widthMm: A4_WIDTH_MM,
  heightMm: A4_HEIGHT_MM,
} as const

// 默认内容内边距 (px)。模板的 spacing.contentPadding 仍可覆盖。
export const DEFAULT_PAGE_PADDING_PX = 40

export function a4ContentHeightPx(contentPadding: number): number {
  return A4_HEIGHT_PX - contentPadding * 2
}

export function a4ContentWidthPx(contentPadding: number): number {
  return A4_WIDTH_PX - contentPadding * 2
}