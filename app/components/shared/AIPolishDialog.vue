<template>
  <t-dialog
    :visible="visible"
    :header="t('ai.polish')"
    :footer="false"
    width="640px"
    @close="onClose"
  >
    <div class="space-y-3">
      <!-- 自定义指令输入框 -->
      <div>
        <label class="block text-sm text-gray-600 mb-1">
          自定义要求（可选）
        </label>
        <t-textarea
          v-model="customInstructions"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="例如：突出量化成果，加强技术关键词"
        />
      </div>

      <!-- 待润色内容预览 -->
      <div>
        <label class="block text-sm text-gray-600 mb-1">
          原文
        </label>
        <div class="bg-[hsl(var(--muted))] rounded p-3 text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
          {{ content || '（无内容）' }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-2">
        <t-button
          theme="primary"
          :loading="isPolishing"
          :disabled="!content || isPolishing"
          @click="onPolish"
        >
          {{ isPolishing ? '润色中...' : '开始润色' }}
        </t-button>
        <t-button
          v-if="isPolishing"
          theme="danger"
          variant="outline"
          @click="onAbort"
        >
          中止
        </t-button>
        <t-button
          v-if="polishedContent"
          theme="success"
          @click="onApply"
        >
          应用润色结果
        </t-button>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="text-sm text-red-500">
        {{ error }}
      </div>

      <!-- 流式润色结果 -->
      <div v-if="polishedContent || isPolishing">
        <label class="block text-sm text-gray-600 mb-1">
          润色结果
        </label>
        <div class="bg-[hsl(var(--accent))] rounded p-3 text-sm max-h-60 overflow-y-auto whitespace-pre-wrap">
          {{ polishedContent }}
          <span v-if="isPolishing" class="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
        </div>
      </div>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { useAIPolish } from '~/composables/useAIPolish'

const props = defineProps<{
  visible: boolean
  content: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: false): void
  (e: 'apply', polishedContent: string): void
  (e: 'close'): void
}>()

const { t } = useI18n()
const {
  isPolishing,
  polishedContent,
  error,
  polish,
  abort,
  reset,
} = useAIPolish()

// 自定义指令
const customInstructions = ref('')

// 执行润色
const onPolish = async () => {
  if (!props.content) return
  await polish(props.content, customInstructions.value)
}

// 中止润色
const onAbort = () => {
  abort()
}

// 应用润色结果
const onApply = () => {
  if (!polishedContent.value) return
  emit('apply', polishedContent.value)
  emit('update:visible', false)
  emit('close')
}

// 关闭对话框
const onClose = () => {
  abort()
  reset()
  customInstructions.value = ''
  emit('update:visible', false)
  emit('close')
}
</script>
