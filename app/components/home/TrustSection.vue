<template>
  <section class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
        <div
          v-for="item in trustItems"
          :key="item.key"
          class="text-center"
        >
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))]">
            <component :is="item.icon" class="h-[22px] w-[22px]" />
          </div>
          <div class="text-[13px] font-medium text-[hsl(var(--text-secondary))]">
            {{ t(`landing.trust.${item.key}`) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ShieldCheck, FileText, Sparkles, Globe } from 'lucide-vue-next'
import type { Component } from 'vue'

const { t } = useI18n()

interface TrustItem {
  key: string
  icon: Component
}

const trustItems: TrustItem[] = [
  { key: 'free', icon: FileText },
  { key: 'privacy', icon: ShieldCheck },
  { key: 'ai', icon: Sparkles },
  { key: 'export', icon: Globe },
]
</script>
