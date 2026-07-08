<template>
  <div class="error-page min-h-screen bg-[hsl(var(--bg-base))] flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <div class="text-[100px] font-bold leading-none text-[hsl(var(--brand))]/20 select-none">
        404
      </div>

      <h1 class="mt-6 text-2xl font-bold text-[hsl(var(--text-primary))]">
        {{ t('error.title') }}
      </h1>

      <p class="mt-3 text-[15px] leading-relaxed text-[hsl(var(--text-secondary))]">
        {{ t('error.description') }}
      </p>

      <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <NuxtLink
          :to="localePath('/')"
          class="inline-flex h-11 items-center gap-2 rounded-lg bg-[hsl(var(--brand))] px-6 text-[14px] font-medium text-white transition-all duration-200 hover:opacity-90"
        >
          <ArrowLeft class="h-4 w-4" />
          {{ t('error.backHome') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/dashboard')"
          class="inline-flex h-11 items-center gap-2 rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] px-6 text-[14px] font-medium text-[hsl(var(--text-secondary))] transition-all duration-200 hover:text-[hsl(var(--text-primary))]"
        >
          {{ t('nav.dashboard') }}
        </NuxtLink>
      </div>

      <div class="mt-10 flex items-center justify-center gap-6 text-[13px] text-[hsl(var(--text-secondary))]">
        <NuxtLink :to="localePath('/')" class="hover:text-[hsl(var(--text-primary))] transition-colors">
          {{ t('nav.home') }}
        </NuxtLink>
        <span class="text-[hsl(var(--border-default))]">·</span>
        <span>{{ t('common.appName') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: t('error.title'),
  description: t('error.description'),
  robots: 'noindex, nofollow',
})
</script>
