// 条目级保存状态反馈
// 编辑触发 saving，防抖 400ms 后切到 saved，再 1.5s 后恢复 idle
export function useItemSaveStatus() {
  const status = ref<'idle' | 'saving' | 'saved'>('idle')
  let savingTimer: ReturnType<typeof setTimeout> | null = null
  let savedTimer: ReturnType<typeof setTimeout> | null = null

  const markSaving = () => {
    if (savedTimer) {
      clearTimeout(savedTimer)
      savedTimer = null
    }
    status.value = 'saving'
    if (savingTimer) clearTimeout(savingTimer)
    savingTimer = setTimeout(() => {
      status.value = 'saved'
      savingTimer = null
      savedTimer = setTimeout(() => {
        status.value = 'idle'
        savedTimer = null
      }, 1500)
    }, 400)
  }

  onBeforeUnmount(() => {
    if (savingTimer) clearTimeout(savingTimer)
    if (savedTimer) clearTimeout(savedTimer)
  })

  return { status, markSaving }
}
