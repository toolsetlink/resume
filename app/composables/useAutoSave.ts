import { useResumeStore } from '~/stores/resume'

// 自动保存 composable
// 持久化由 Pinia persist 插件自动写入 localStorage，这里主要用于：
// 1. 防抖触发保存提示
// 2. 暴露保存状态给 UI
export function useAutoSave() {
  const resumeStore = useResumeStore()
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  // 最近一次保存时间
  const lastSavedAt = ref<Date | null>(null)
  // 是否正在保存
  const isSaving = ref(false)

  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer)
    isSaving.value = true
    saveTimer = setTimeout(() => {
      // persist 插件会自动监听 state 变化并写入 localStorage
      // 这里只需更新 UI 状态
      isSaving.value = false
      lastSavedAt.value = new Date()
    }, 1500)
  }

  // 监听 store 变化
  watch(
    () => resumeStore.$state,
    () => {
      scheduleSave()
    },
    { deep: true }
  )

  return {
    scheduleSave,
    isSaving,
    lastSavedAt,
  }
}
