# Fix PDF Export Extra Blank Page

## Problem Summary
The PDF export generates 3 pages when the content should only occupy 2 pages, with the 3rd page being blank.

## Root Cause Analysis

The pagination calculation in `usePdfExport.ts`:
- `contentHeightPerPage = A4_HEIGHT - margin * 2 = 1123 - 64 = 1059`
- `totalPages = Math.ceil(contentHeight / contentHeightPerPage)`

The `contentHeight` is calculated as:
```typescript
const contentHeight = Math.max(sourceEl.scrollHeight, sourceEl.offsetHeight, A4_HEIGHT)
```

**Issue**: The `clearConstraints` function (lines 99-112) only clears `overflow` and `maxHeight` on child elements, but NOT `minHeight`. Even though we set `sourceEl.style.minHeight = '0'` on line 94, child elements like `.resume-preview-container` and template roots still have `min-height: 100%`, which can cause the parent's `scrollHeight` to be slightly larger than the actual rendered content.

This causes `contentHeight` to be overestimated, resulting in `Math.ceil(contentHeight / 1059) = 3` instead of 2.

## Proposed Changes

### File: `app/composables/usePdfExport.ts`

**Location**: Lines 99-112 (the `clearConstraints` function)

**What to change**: Add `minHeight` clearing logic to the `clearConstraints` function

**Why**: To ensure all child elements have their min-height constraints removed before measuring content height, preventing the parent container from being artificially inflated

**How**: Add a check for `computed.minHeight !== '0px'` and set `el.style.minHeight = '0'`

```typescript
const clearConstraints = (el: Element) => {
  if (el instanceof HTMLElement) {
    const computed = window.getComputedStyle(el)
    // 只清除会限制内容显示的样式
    if (computed.overflow !== 'visible') {
      el.style.overflow = 'visible'
    }
    if (computed.maxHeight !== 'none') {
      el.style.maxHeight = 'none'
    }
    // 新增：清除 min-height 限制，防止子元素反向撑大父容器高度
    if (computed.minHeight !== '0px') {
      el.style.minHeight = '0'
    }
  }
  Array.from(el.children).forEach(clearConstraints)
}
```

## Verification Steps

1. Run existing tests: `pnpm test`
2. Manual test with 2-page content: Export PDF and verify it has exactly 2 pages (no blank 3rd page)
3. Manual test with 1-page content: Export PDF and verify it has exactly 1 page
4. Verify that after export, the page layout returns to normal (styles are restored)
