<template>
  <footer class="border-t border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-card))]/50 backdrop-blur-sm">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
        
        <div class="flex items-center gap-2">
          <span
            class="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[hsl(var(--brand))] text-[hsl(var(--text-inverse))]"
            style="box-shadow: var(--shadow-sm)"
          >
            <FileText class="h-4 w-4" />
          </span>
          <span class="text-[15px] font-semibold text-[hsl(var(--text-primary))]">
            {{ t('common.appName') }}
          </span>
        </div>

        
        <nav class="flex items-center gap-6 text-[13px]">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-[hsl(var(--text-secondary))] transition-colors duration-200 hover:text-[hsl(var(--text-primary))]"
          >
            <Github class="h-[15px] w-[15px]" />
            {{ t('landing.footer.links.github') }}
          </a>
          <a
            href="#"
            class="text-[hsl(var(--text-secondary))] transition-colors duration-200 hover:text-[hsl(var(--text-primary))]"
          >
            {{ t('landing.footer.links.privacy') }}
          </a>
          <a
            href="#"
            class="text-[hsl(var(--text-secondary))] transition-colors duration-200 hover:text-[hsl(var(--text-primary))]"
          >
            {{ t('landing.footer.links.terms') }}
          </a>
        </nav>
      </div>

      
      <div class="mt-8 border-t border-[hsl(var(--border-default))]/50 pt-8 text-center">
        <p class="text-[13px] text-[hsl(var(--text-secondary))]">
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
