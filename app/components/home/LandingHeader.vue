<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-base))]/80 backdrop-blur-sm"
  >
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <NuxtLink :to="localePath('/')" class="group flex items-center gap-2">
        <span
          class="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[hsl(var(--brand))] text-[hsl(var(--text-inverse))] shadow-sm transition-transform duration-300 group-hover:scale-105"
          style="box-shadow: 0 2px 8px -2px hsl(var(--brand) / 0.5)"
        >
          <FileText class="h-[18px] w-[18px]" />
        </span>
        <span class="text-[17px] font-semibold text-[hsl(var(--text-primary))]">
          {{ t('common.appName') }}
        </span>
      </NuxtLink>

      <!-- 桌面端导航 -->
      <nav class="hidden items-center gap-1 md:flex">
        <NuxtLink
          :to="localePath('/dashboard')"
          class="rounded-lg px-3 py-2 text-[13px] font-medium text-[hsl(var(--text-secondary))] transition-colors duration-200 hover:text-[hsl(var(--text-primary))]"
        >
          {{ t('nav.dashboard') }}
        </NuxtLink>
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="rounded-lg px-3 py-2 text-[13px] font-medium text-[hsl(var(--text-secondary))] transition-colors duration-200 hover:text-[hsl(var(--text-primary))]"
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- 右侧操作 -->
      <div class="flex items-center gap-1">
        <!-- 语言切换 -->
        <t-dropdown :min-column-width="120">
          <t-button variant="text" shape="square" class="!rounded-md hover:!bg-[hsl(var(--bg-subtle))]">
            <Languages class="h-[18px] w-[18px]" />
          </t-button>
          <t-dropdown-menu>
            <t-dropdown-item
              v-for="loc in locales"
              :key="loc.code"
              @click="switchLocale(loc.code)"
            >
              <span :class="{ 'font-bold': loc.code === locale }">{{ loc.name }}</span>
            </t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>

        <!-- 暗色切换 -->
        <t-button variant="text" shape="square" class="!rounded-md hover:!bg-[hsl(var(--bg-subtle))]" @click="toggleColorMode">
          <Sun v-if="isDark" class="h-[18px] w-[18px]" />
          <Moon v-else class="h-[18px] w-[18px]" />
        </t-button>

        <!-- 移动端菜单按钮 -->
        <t-button variant="text" shape="square" class="!rounded-md hover:!bg-[hsl(var(--bg-subtle))] md:hidden" @click="mobileOpen = !mobileOpen">
          <Menu v-if="!mobileOpen" class="h-[18px] w-[18px]" />
          <X v-else class="h-[18px] w-[18px]" />
        </t-button>
      </div>
    </div>

    <!-- 移动端导航抽屉 -->
    <transition
      enter-active-class="transition duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="border-t border-[hsl(var(--border-default))]/60 bg-[hsl(var(--bg-base))]/95 backdrop-blur-xl md:hidden">
        <nav class="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
          <NuxtLink
            :to="localePath('/dashboard')"
            class="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))]"
            @click="mobileOpen = false"
          >
            {{ t('nav.dashboard') }}
          </NuxtLink>
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))]"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </a>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { FileText, Languages, Sun, Moon, Menu, X } from 'lucide-vue-next'

const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const colorMode = useColorMode()

const mobileOpen = ref(false)

const isDark = computed(() => colorMode.value === 'dark')

const navLinks = computed(() => [
  { href: '#features', label: t('landing.nav.features') },
  { href: '#templates', label: t('landing.nav.templates') },
  { href: '#faq', label: t('landing.nav.faq') },
])

const toggleColorMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const switchLocale = (code: string) => {
  setLocale(code as 'zh' | 'en')
}
</script>
