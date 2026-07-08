<template>
  <div class="ai-config-page p-8 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ t('ai.config') }}</h1>
      <t-tag :theme="aiConfig.isConfigured ? 'success' : 'warning'" variant="light">
        {{ aiConfig.isConfigured ? '已配置' : '未配置' }}
      </t-tag>
    </div>

    <t-form label-align="top" class="space-y-6">
      <!-- 供应商选择 -->
      <t-form-item :label="t('ai.selectProvider')">
        <t-radio-group v-model="selectedModel" @change="onProviderChange">
          <t-radio
            v-for="key in providerKeys"
            :key="key"
            :value="key"
          >
            {{ t(`ai.providers.${key}`) }}
          </t-radio>
        </t-radio-group>
      </t-form-item>

      <!-- 供应商跳转链接 -->
      <div class="text-sm text-gray-500 -mt-4">
        <a
          :href="currentProvider.website"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-500 hover:underline"
        >
          {{ t('ai.apiKey') }} 申请入口 →
        </a>
      </div>

      <!-- 豆包配置 -->
      <template v-if="aiConfig.selectedModel === 'doubao'">
        <t-form-item :label="t('ai.apiKey')">
          <t-input
            v-model="doubaoApiKey"
            placeholder="volc-xxx"
            type="password"
          />
        </t-form-item>
        <t-form-item :label="t('ai.modelId')">
          <t-input
            v-model="doubaoModelId"
            placeholder="ep-xxxxxxx"
          />
        </t-form-item>
      </template>

      <!-- DeepSeek 配置 -->
      <template v-if="aiConfig.selectedModel === 'deepseek'">
        <t-form-item :label="t('ai.apiKey')">
          <t-input
            v-model="deepseekApiKey"
            placeholder="sk-xxx"
            type="password"
          />
        </t-form-item>
        <t-form-item :label="t('ai.modelId')">
          <t-input
            v-model="deepseekModelId"
            placeholder="deepseek-chat"
          />
        </t-form-item>
      </template>

      <!-- OpenAI 兼容配置 -->
      <template v-if="aiConfig.selectedModel === 'openai'">
        <t-form-item :label="t('ai.apiKey')">
          <t-input
            v-model="openaiApiKey"
            placeholder="sk-xxx"
            type="password"
          />
        </t-form-item>
        <t-form-item :label="t('ai.modelId')">
          <t-input
            v-model="openaiModelId"
            placeholder="gpt-4o-mini"
          />
        </t-form-item>
        <t-form-item :label="t('ai.endpoint')">
          <t-input
            v-model="openaiApiEndpoint"
            placeholder="https://api.openai.com/v1"
          />
        </t-form-item>
      </template>

      <!-- Gemini 配置 -->
      <template v-if="aiConfig.selectedModel === 'gemini'">
        <t-form-item :label="t('ai.apiKey')">
          <t-input
            v-model="geminiApiKey"
            placeholder="AIzaSyXXX"
            type="password"
          />
        </t-form-item>
        <t-form-item :label="t('ai.modelId')">
          <t-input
            v-model="geminiModelId"
            placeholder="gemini-flash-latest"
          />
        </t-form-item>
      </template>

      <!-- 保存按钮 -->
      <div class="flex items-center justify-end gap-2 pt-2">
        <t-button @click="goBack">{{ t('common.back') }}</t-button>
        <t-button theme="primary" :disabled="!aiConfig.isConfigured" @click="onSave">
          {{ t('common.save') }}
        </t-button>
      </div>
    </t-form>

    <!-- 保存反馈（轻提示） -->
    <div
      v-if="messageContent"
      class="fixed top-4 right-4 px-4 py-2 rounded shadow text-sm text-white"
      :class="messageTheme === 'success' ? 'bg-green-500' : 'bg-orange-500'"
    >
      {{ messageContent }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AIModelType } from '#shared/config/ai'
import { AI_PROVIDER_INFO } from '#shared/config/ai'
import { useAIConfigStore } from '~/stores/aiConfig'

definePageMeta({
  layout: 'app',
})

const { t } = useI18n()
const router = useRouter()
const aiConfig = useAIConfigStore()

// 供应商列表
const providerKeys: AIModelType[] = ['doubao', 'deepseek', 'openai', 'gemini']

// 当前选中供应商
const selectedModel = computed<AIModelType>({
  get: () => aiConfig.selectedModel,
  set: (val: AIModelType) => aiConfig.setSelectedModel(val),
})

// 当前供应商信息
const currentProvider = computed(
  () => AI_PROVIDER_INFO[aiConfig.selectedModel]
)

// 表单字段双向绑定
const doubaoApiKey = computed({
  get: () => aiConfig.doubaoApiKey,
  set: (val: string) => aiConfig.setDoubaoApiKey(val),
})
const doubaoModelId = computed({
  get: () => aiConfig.doubaoModelId,
  set: (val: string) => aiConfig.setDoubaoModelId(val),
})
const deepseekApiKey = computed({
  get: () => aiConfig.deepseekApiKey,
  set: (val: string) => aiConfig.setDeepseekApiKey(val),
})
const deepseekModelId = computed({
  get: () => aiConfig.deepseekModelId,
  set: (val: string) => aiConfig.setDeepseekModelId(val),
})
const openaiApiKey = computed({
  get: () => aiConfig.openaiApiKey,
  set: (val: string) => aiConfig.setOpenaiApiKey(val),
})
const openaiModelId = computed({
  get: () => aiConfig.openaiModelId,
  set: (val: string) => aiConfig.setOpenaiModelId(val),
})
const openaiApiEndpoint = computed({
  get: () => aiConfig.openaiApiEndpoint,
  set: (val: string) => aiConfig.setOpenaiApiEndpoint(val),
})
const geminiApiKey = computed({
  get: () => aiConfig.geminiApiKey,
  set: (val: string) => aiConfig.setGeminiApiKey(val),
})
const geminiModelId = computed({
  get: () => aiConfig.geminiModelId,
  set: (val: string) => aiConfig.setGeminiModelId(val),
})

// 供应商切换事件
const onProviderChange = (val: AIModelType) => {
  aiConfig.setSelectedModel(val)
}

// 保存反馈消息
const messageContent = ref('')
const messageTheme = ref<'success' | 'warning'>('success')
let messageTimer: ReturnType<typeof setTimeout> | null = null

// 保存（持久化由 store 自动处理，这里仅做反馈）
const onSave = () => {
  if (!aiConfig.isConfigured) {
    messageContent.value = '配置不完整，请补全必填项'
    messageTheme.value = 'warning'
  } else {
    messageContent.value = '保存成功'
    messageTheme.value = 'success'
  }
  // 2 秒后自动清除提示
  if (messageTimer) clearTimeout(messageTimer)
  messageTimer = setTimeout(() => {
    messageContent.value = ''
  }, 2000)
}

// 返回
const goBack = () => {
  router.back()
}

useHead({ title: `${t('ai.config')} - 自由简历` })
</script>
