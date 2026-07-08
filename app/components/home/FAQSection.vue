<template>
  <section id="faq" class="py-24 sm:py-32">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      
      <div class="text-center">
        <h2 class="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] text-[hsl(var(--text-primary))] sm:text-4xl">
          {{ t('landing.faq.title') }}
        </h2>
      </div>

      
      <div class="mt-12 space-y-3">
        <div
          v-for="(item, idx) in faqKeys"
          :key="item"
          class="overflow-hidden rounded-[16px] border border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))] transition-all duration-300 hover:border-[hsl(var(--border-default))]"
          :style="openIndex === idx ? { boxShadow: 'var(--shadow-md)' } : { boxShadow: 'var(--shadow-sm)' }"
        >
          <button
            class="flex w-full items-center justify-between gap-3 px-6 py-5 text-left transition-colors duration-200 hover:bg-[hsl(var(--bg-subtle))]/40"
            :aria-expanded="openIndex === idx"
            @click="toggle(idx)"
          >
            <span class="text-[16px] font-medium text-[hsl(var(--text-primary))]">
              {{ t(`landing.faq.items.${item}.q`) }}
            </span>
            <span
              class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--bg-subtle))] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              :class="openIndex === idx ? 'rotate-180 bg-[hsl(var(--brand))] text-[hsl(var(--text-inverse))]' : 'text-[hsl(var(--text-secondary))]'"
            >
              <ChevronDown class="h-4 w-4" />
            </span>
          </button>
          <div
            class="grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            :class="openIndex === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
          >
            <div class="overflow-hidden">
              <p class="px-6 pb-5 text-[15px] leading-[1.6] text-[hsl(var(--text-secondary))]">
                {{ t(`landing.faq.items.${item}.a`) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

const { t } = useI18n()

const faqKeys = ['free', 'privacy', 'export']

const openIndex = ref<number | null>(0)

const toggle = (idx: number) => {
  openIndex.value = openIndex.value === idx ? null : idx
}
</script>
