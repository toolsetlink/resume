<template>
  <section id="features" class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- 标题：苹果式居中布局 -->
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-[hsl(var(--foreground))] sm:text-4xl">
          {{ t('landing.features.title') }}
        </h2>
        <p class="mx-auto mt-5 max-w-2xl text-[19px] leading-relaxed text-[hsl(var(--muted-foreground))]">
          {{ t('landing.features.subtitle') }}
        </p>
      </div>

      <!-- 卡片网格：苹果风格圆角 + 多层阴影 -->
      <div class="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(item, idx) in featureList"
          :key="item.key"
          class="landing-card group relative rounded-[20px] border border-[hsl(var(--border))]/60 bg-[hsl(var(--card))] p-7 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:border-[hsl(var(--primary))]/30"
          :style="{ animationDelay: `${idx * 80}ms`, boxShadow: 'var(--shadow-sm)' }"
          @mouseenter="hovered = idx"
          @mouseleave="hovered = null"
        >
          <!-- 悬停时增加的动态阴影 -->
          <div
            class="pointer-events-none absolute inset-0 -z-10 rounded-[20px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style="box-shadow: var(--shadow-lg)"
          />
          <!-- 图标：苹果风格圆角方块，悬停色彩反转 -->
          <div
            class="mb-5 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105 group-hover:bg-[hsl(var(--primary))] group-hover:text-[hsl(var(--primary-foreground))]"
            style="box-shadow: var(--shadow-xs)"
          >
            <component :is="item.icon" class="h-[22px] w-[22px]" />
          </div>
          <!-- 文案：苹果式标题字距 + 副文本对比 -->
          <h3 class="text-[18px] font-semibold tracking-[-0.022em] text-[hsl(var(--foreground))]">
            {{ t(`landing.features.items.${item.key}.title`) }}
          </h3>
          <p class="mt-2 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            {{ t(`landing.features.items.${item.key}.desc`) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  LayoutTemplate,
  Sparkles,
  SpellCheck,
  FileDown,
  Eye,
  HardDrive,
} from 'lucide-vue-next'
import type { Component } from 'vue'

const { t } = useI18n()

interface FeatureItem {
  key: string
  icon: Component
}

const featureList: FeatureItem[] = [
  { key: 'templates', icon: LayoutTemplate },
  { key: 'ai', icon: Sparkles },
  { key: 'grammar', icon: SpellCheck },
  { key: 'pdf', icon: FileDown },
  { key: 'preview', icon: Eye },
  { key: 'sync', icon: HardDrive },
]

const hovered = ref<number | null>(null)
</script>
