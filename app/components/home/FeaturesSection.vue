<template>
  <section id="features" class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] text-[hsl(var(--text-primary))] sm:text-4xl">
          {{ t('landing.features.title') }}
        </h2>
        <p class="mx-auto mt-5 max-w-2xl text-[19px] leading-relaxed text-[hsl(var(--text-secondary))]">
          {{ t('landing.features.subtitle') }}
        </p>
      </div>

      <div class="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(item, idx) in featureList"
          :key="item.key"
          class="fade-in-up group rounded-[12px] border border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))] p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          :style="{ animationDelay: `${idx * 80}ms` }"
        >
          <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))] transition-all duration-200 group-hover:bg-[hsl(var(--brand))] group-hover:text-white">
            <component :is="item.icon" class="h-[22px] w-[22px]" />
          </div>
          <h3 class="text-[18px] font-semibold text-[hsl(var(--text-primary))]">
            {{ t(`landing.features.items.${item.key}.title`) }}
          </h3>
          <p class="mt-2 text-[15px] leading-relaxed text-[hsl(var(--text-secondary))]">
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
  { key: 'pdf', icon: FileDown },
  { key: 'preview', icon: Eye },
  { key: 'sync', icon: HardDrive },
]
</script>
