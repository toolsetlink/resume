<template>
  <footer class="border-t border-[hsl(var(--border))]/60 bg-[hsl(var(--card))]/50 backdrop-blur-sm">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <!-- Logo：苹果风格精致图标 -->
        <div class="flex items-center gap-2">
          <span
            class="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
            style="box-shadow: var(--shadow-xs)"
          >
            <FileText class="h-4 w-4" />
          </span>
          <span class="text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--foreground))]">
            {{ t('common.appName') }}
          </span>
        </div>

        <!-- 链接：苹果风格悬浮文字 -->
        <nav class="flex items-center gap-6 text-[13px]">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] transition-colors duration-200 hover:text-[hsl(var(--foreground))]"
          >
            <Github class="h-[15px] w-[15px]" />
            {{ t('landing.footer.links.github') }}
          </a>
          <a
            href="#"
            class="text-[hsl(var(--muted-foreground))] transition-colors duration-200 hover:text-[hsl(var(--foreground))]"
          >
            {{ t('landing.footer.links.privacy') }}
          </a>
          <a
            href="#"
            class="text-[hsl(var(--muted-foreground))] transition-colors duration-200 hover:text-[hsl(var(--foreground))]"
          >
            {{ t('landing.footer.links.terms') }}
          </a>
        </nav>
      </div>

      <!-- 版权：苹果风格细分隔线 -->
      <div class="mt-8 border-t border-[hsl(var(--border))]/50 pt-8 text-center">
        <p class="text-[13px] text-[hsl(var(--muted-foreground))]">
          {{ t('landing.footer.copyright') }}
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { FileText, Github } from 'lucide-vue-next'

const { t } = useI18n()
</script>
