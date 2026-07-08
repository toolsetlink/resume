<template>
  <section class="relative overflow-hidden">
    <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
      <div class="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
        <div class="fade-in-up text-center lg:text-left">
          <span
            class="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))]/80 px-3.5 py-1.5 text-[12px] font-medium text-[hsl(var(--text-secondary))]"
          >
            <ShieldCheck class="h-3.5 w-3.5 text-[hsl(var(--brand))]" />
            {{ t('landing.hero.badge') }}
          </span>

          <h1 class="mt-7 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] text-[hsl(var(--text-primary))] sm:text-5xl lg:text-[4.5rem]">
            {{ t('landing.hero.title') }}
          </h1>

          <p class="mx-auto mt-6 max-w-xl text-[19px] leading-relaxed text-[hsl(var(--text-secondary))] lg:mx-0">
            {{ t('landing.hero.subtitle') }}
          </p>

          <div class="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <t-button
              theme="primary"
              size="large"
              class="!h-12 !px-7 !text-[15px] !font-medium transition-all duration-200 hover:!scale-[1.02] active:!scale-[0.98]"
              @click="goCreate"
            >
              <Plus class="mr-1.5 h-[18px] w-[18px]" />
              {{ t('landing.hero.cta.create') }}
            </t-button>
            <t-button
              variant="outline"
              size="large"
              class="!h-12 !px-7 !text-[15px] !font-medium transition-all duration-200 hover:!bg-[hsl(var(--bg-subtle))] hover:!scale-[1.02] active:!scale-[0.98]"
              @click="goTemplates"
            >
              <LayoutTemplate class="mr-1.5 h-[18px] w-[18px]" />
              {{ t('landing.hero.cta.templates') }}
            </t-button>
          </div>
        </div>

        <div class="fade-in-up relative mx-auto w-full max-w-md lg:max-w-none">
          <div
            class="rounded-[12px] border border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))] p-8 transition-shadow duration-200 hover:shadow-lg"
            style="box-shadow: var(--shadow-md)"
          >
            <div class="flex items-center gap-4 border-b border-[hsl(var(--border-default))] pb-5">
              <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-[18px] font-bold text-white">
                {{ t('landing.hero.preview.name').charAt(0) }}
              </div>
              <div>
                <div class="text-[18px] font-semibold text-[hsl(var(--text-primary))]">
                  {{ t('landing.hero.preview.name') }}
                </div>
                <div class="text-[14px] text-[hsl(var(--text-secondary))]">
                  {{ t('landing.hero.preview.title') }}
                </div>
              </div>
            </div>

            <div class="mt-5 space-y-5">
              <div v-for="i in 3" :key="i" class="space-y-2.5">
                <div class="h-3 w-24 rounded bg-[hsl(var(--brand))] opacity-80" />
                <div class="h-2 w-full rounded bg-[hsl(var(--bg-subtle))]" />
                <div class="h-2 w-5/6 rounded bg-[hsl(var(--bg-subtle))]" />
                <div class="h-2 w-4/6 rounded bg-[hsl(var(--bg-subtle))]" />
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-2">
              <span
                v-for="tag in tags"
                :key="tag"
                class="rounded-full bg-[hsl(var(--bg-subtle))] px-3 py-1 text-[12px] font-medium text-[hsl(var(--text-primary))] transition-colors hover:bg-[hsl(var(--brand))] hover:text-white"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ShieldCheck, Plus, LayoutTemplate } from 'lucide-vue-next'

const { t, locale } = useI18n()
const router = useRouter()
const localePath = useLocalePath()

const tags = computed(() =>
  locale.value === 'zh'
    ? ['React', 'TypeScript', 'Node.js', 'Vue', '团队管理']
    : ['React', 'TypeScript', 'Node.js', 'Vue', 'Leadership']
)

const goCreate = () => router.push(localePath('/dashboard'))
const goTemplates = () => {
  const el = document.getElementById('templates')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>
