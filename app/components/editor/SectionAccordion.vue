<template>
  <div class="w-full flex flex-col">
    <!-- 顶部：标题 + 添加模块按钮 + 引导提示 -->
    <div class="px-4 pt-4 pb-2">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-medium text-gray-600">{{ t('editor.modules') }}</h2>
        <t-button theme="primary" variant="text" size="small" @click="libraryVisible = true">
          <Plus class="w-4 h-4 mr-1" />
          {{ t('editor.addModule') }}
        </t-button>
      </div>

      <!-- 首次使用引导提示条 -->
      <div
        v-if="showGuide"
        class="mt-2 flex items-center gap-2 px-3 py-2 rounded-md bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.2)] text-xs text-gray-600"
      >
        <Lightbulb class="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
        <span class="flex-1">{{ t('editor.guideTip') }}</span>
        <t-button variant="text" size="small" @click="dismissGuide">
          {{ t('editor.gotIt') }}
        </t-button>
      </div>
    </div>

    <draggable
      v-model="sections"
      :item-key="(item: MenuSection) => item.id"
      handle=".section-drag-handle"
      ghost-class="opacity-50"
      class="px-2 pb-3 space-y-2"
      @end="onDragEnd"
    >
      <template #item="{ element, index }">
        <div
          :ref="(el) => setSectionRef(el as HTMLElement | null, element.id)"
          class="section-card rounded border bg-[hsl(var(--card))]"
          :class="{ 'highlight-flash': flashId === element.id }"
        >
          <!-- 标题行：拖拽柄 + 图标 + 标题 + 已隐藏标签 + 上移 + 下移 + 开关 + 展开箭头 -->
          <div
            class="section-drag-handle flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[hsl(var(--muted))]"
            @click="toggleExpand(element.id)"
          >
            <t-tooltip :content="t('editor.dragToSort')" placement="top">
              <GripVertical class="w-4 h-4 text-gray-400 flex-shrink-0" />
            </t-tooltip>
            <span class="text-base">{{ element.icon }}</span>
            <div class="flex-1 flex items-center gap-2 min-w-0">
              <span class="text-sm font-medium truncate">{{ element.title }}</span>
              <span
                v-if="!element.enabled"
                class="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 flex-shrink-0"
              >
                {{ t('editor.hidden') }}
              </span>
            </div>
            <!-- 上移按钮：首模块禁用 -->
            <t-tooltip :content="t('editor.moveUp')" placement="top">
              <t-button
                variant="text"
                shape="square"
                size="small"
                :disabled="index === 0"
                @click.stop="moveUp(element.id)"
              >
                <ChevronUp class="w-4 h-4" />
              </t-button>
            </t-tooltip>
            <!-- 下移按钮：末模块禁用 -->
            <t-tooltip :content="t('editor.moveDown')" placement="top">
              <t-button
                variant="text"
                shape="square"
                size="small"
                :disabled="index === sections.length - 1"
                @click.stop="moveDown(element.id)"
              >
                <ChevronDown class="w-4 h-4" />
              </t-button>
            </t-tooltip>
            <!-- 显隐开关 -->
            <t-tooltip :content="t('editor.toggleVisibility')" placement="top">
              <t-switch
                :model-value="element.enabled"
                size="small"
                @change="(val: boolean) => toggleSection(element.id, val)"
                @click.stop
              />
            </t-tooltip>
            <ChevronDown
              class="w-4 h-4 transition-transform duration-300 flex-shrink-0"
              :class="{ 'rotate-180': expandedIds.has(element.id) }"
            />
          </div>
          <!-- 展开内容：平滑过渡动画 + 动态加载对应 Panel -->
          <div
            class="grid transition-all duration-300 ease-in-out"
            :class="expandedIds.has(element.id) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
          >
            <div class="overflow-hidden">
              <div class="border-t px-3 py-3">
                <component :is="getPanel(element.id)" v-if="getPanel(element.id)" />
                <div v-else class="text-center text-gray-400 py-4">该模块暂无可编辑内容</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <!-- 模块库对话框 -->
    <ModuleLibraryDialog v-model:visible="libraryVisible" @enabled="handleModuleEnabled" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import draggable from 'vuedraggable'
import { GripVertical, ChevronDown, ChevronUp, Plus, Lightbulb } from 'lucide-vue-next'
import type { MenuSection } from '#shared/types/resume'
import { useResumeStore } from '~/stores/resume'

const { t } = useI18n()
const resumeStore = useResumeStore()

// 模块 id 到组件的映射（复用 EditPanel.vue 的 panelMap 逻辑）
// 为每个异步面板配置 errorHandler 与 loadingComponent，避免单个面板
// 加载失败（例如某个依赖的 ESM 默认导出缺失）时，错误沿 <AsyncComponentWrapper>
// 向上冒泡被 Vue 包装成 "Unhandled error during execution of setup function"
// 的不可读警告，并导致整棵 SectionAccordion 子树渲染失败。
const panelMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  basic: defineAsyncComponent({
    loader: () => import('~/components/editor/basic/BasicInfoPanel.vue'),
    onError(err, retry, fail, attempts) {
      if (attempts <= 1) retry()
      else fail()
      console.error('[SectionAccordion] 加载 BasicInfoPanel 失败:', err)
    },
  }),
  education: defineAsyncComponent({
    loader: () => import('~/components/editor/education/EducationPanel.vue'),
    onError(err, retry, fail, attempts) {
      if (attempts <= 1) retry()
      else fail()
      console.error('[SectionAccordion] 加载 EducationPanel 失败:', err)
    },
  }),
  experience: defineAsyncComponent({
    loader: () => import('~/components/editor/experience/ExperiencePanel.vue'),
    onError(err, retry, fail, attempts) {
      if (attempts <= 1) retry()
      else fail()
      console.error('[SectionAccordion] 加载 ExperiencePanel 失败:', err)
    },
  }),
  projects: defineAsyncComponent({
    loader: () => import('~/components/editor/project/ProjectPanel.vue'),
    onError(err, retry, fail, attempts) {
      if (attempts <= 1) retry()
      else fail()
      console.error('[SectionAccordion] 加载 ProjectPanel 失败:', err)
    },
  }),
  certificates: defineAsyncComponent({
    loader: () => import('~/components/editor/certificates/CertificatesPanel.vue'),
    onError(err, retry, fail, attempts) {
      if (attempts <= 1) retry()
      else fail()
      console.error('[SectionAccordion] 加载 CertificatesPanel 失败:', err)
    },
  }),
  skills: defineAsyncComponent({
    loader: () => import('~/components/editor/skills/SkillPanel.vue'),
    onError(err, retry, fail, attempts) {
      if (attempts <= 1) retry()
      else fail()
      console.error('[SectionAccordion] 加载 SkillPanel 失败:', err)
    },
  }),
  selfEvaluation: defineAsyncComponent({
    loader: () => import('~/components/editor/self-evaluation/SelfEvaluationPanel.vue'),
    onError(err, retry, fail, attempts) {
      if (attempts <= 1) retry()
      else fail()
      console.error('[SectionAccordion] 加载 SelfEvaluationPanel 失败:', err)
    },
  }),
  custom: defineAsyncComponent({
    loader: () => import('~/components/editor/custom/CustomPanel.vue'),
    onError(err, retry, fail, attempts) {
      if (attempts <= 1) retry()
      else fail()
      console.error('[SectionAccordion] 加载 CustomPanel 失败:', err)
    },
  }),
}

const getPanel = (id: string) => panelMap[id] ?? null

// 可排序的模块列表（绑定到 store.menuSections）
const sections = computed<MenuSection[]>({
  get: () => {
    const list = resumeStore.activeResume?.menuSections || []
    // 确保按 order 排序，便于首/末模块判断
    return [...list].sort((a, b) => a.order - b.order)
  },
  set: (val: MenuSection[]) => {
    if (!resumeStore.activeResumeId) return
    // 排序后重新计算 order
    const ordered = val.map((s, idx) => ({ ...s, order: idx }))
    resumeStore.updateMenuSections(resumeStore.activeResumeId, ordered)
  },
})

const onDragEnd = () => {
  // 由 v-model 自动同步
}

// 上下移动
const moveUp = (sectionId: string) => {
  if (!resumeStore.activeResumeId) return
  resumeStore.moveMenuSection(resumeStore.activeResumeId, sectionId, 'up')
}

const moveDown = (sectionId: string) => {
  if (!resumeStore.activeResumeId) return
  resumeStore.moveMenuSection(resumeStore.activeResumeId, sectionId, 'down')
}

// 展开状态持久化 key
const EXPAND_STORAGE_KEY = 'resume-section-expand-state'
// 引导提示已读标记 key
const GUIDE_SEEN_KEY = 'resume-section-guide-seen'

// 读取持久化的展开状态
const loadExpandedIds = (): Set<string> => {
  const resumeId = resumeStore.activeResumeId
  if (!resumeId) return new Set()
  try {
    const raw = localStorage.getItem(EXPAND_STORAGE_KEY)
    if (!raw) return new Set()
    const data = JSON.parse(raw) as Record<string, string[]>
    const ids = data[resumeId]
    if (Array.isArray(ids) && ids.length > 0) {
      return new Set(ids)
    }
  } catch {
    // 忽略解析错误
  }
  // 默认展开 activeSection 或 basic
  const defaultSection = resumeStore.activeResume?.activeSection || 'basic'
  return new Set([defaultSection])
}

// 持久化展开状态
const saveExpandedIds = (ids: Set<string>) => {
  const resumeId = resumeStore.activeResumeId
  if (!resumeId) return
  try {
    const raw = localStorage.getItem(EXPAND_STORAGE_KEY)
    const data: Record<string, string[]> = raw ? JSON.parse(raw) : {}
    data[resumeId] = Array.from(ids)
    localStorage.setItem(EXPAND_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // 忽略写入错误
  }
}

const expandedIds = ref<Set<string>>(new Set())

// 首次使用引导：仅在未标记为已读时显示
const showGuide = ref(false)

onMounted(() => {
  expandedIds.value = loadExpandedIds()
  try {
    showGuide.value = !localStorage.getItem(GUIDE_SEEN_KEY)
  } catch {
    showGuide.value = false
  }
})

// 关闭引导提示
const dismissGuide = () => {
  showGuide.value = false
  try {
    localStorage.setItem(GUIDE_SEEN_KEY, '1')
  } catch {
    // 忽略写入错误
  }
}

// 切换展开/折叠
const toggleExpand = (id: string) => {
  const next = new Set(expandedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
    // 展开时记录最近激活模块
    if (resumeStore.activeResumeId) {
      resumeStore.setActiveSection(resumeStore.activeResumeId, id)
    }
  }
  expandedIds.value = next
  saveExpandedIds(next)
}

// 切换模块开关（仅控制右侧预览，不影响左侧编辑）
const toggleSection = (id: string, val: boolean) => {
  if (!resumeStore.activeResumeId) return
  const resume = resumeStore.activeResume
  if (!resume) return
  const section = resume.menuSections.find((s) => s.id === id)
  if (!section) return
  if (section.enabled !== val) {
    resumeStore.toggleMenuSection(resumeStore.activeResumeId, id)
  }
}

// 模块库对话框
const libraryVisible = ref(false)

// 高亮闪烁的模块 id（启用模块后触发）
const flashId = ref<string | null>(null)

// 模块卡片 DOM 引用（用于滚动定位）
const sectionRefs = new Map<string, HTMLElement>()

const setSectionRef = (el: HTMLElement | null, id: string) => {
  if (el) {
    sectionRefs.set(id, el)
  } else {
    sectionRefs.delete(id)
  }
}

// 模块库启用模块后的反馈：高亮闪烁 + 滚动到对应卡片
const handleModuleEnabled = (sectionId: string) => {
  // 自动展开该模块
  const next = new Set(expandedIds.value)
  next.add(sectionId)
  expandedIds.value = next
  saveExpandedIds(next)

  // 等 DOM 更新后滚动并闪烁
  nextTick(() => {
    const el = sectionRefs.get(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    flashId.value = sectionId
    setTimeout(() => {
      if (flashId.value === sectionId) {
        flashId.value = null
      }
    }, 600)
  })
}
</script>
