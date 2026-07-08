<template>
  <section class="relative overflow-hidden">
    <!-- 苹果风格柔和背景渐变：更克制、更精致 -->
    <div
      class="absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(var(--accent))]/40 via-[hsl(var(--background))] to-[hsl(var(--background))]"
    />
    <!-- 顶部柔光：模拟苹果产品页的渐变光晕 -->
    <div
      class="absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[hsl(var(--primary))]/8 blur-[120px]"
    />
    <!-- 次级柔光：增加深度感 -->
    <div
      class="absolute right-1/4 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-[hsl(var(--primary))]/5 blur-[100px]"
    />

    <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
      <div class="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
        <!-- 左侧：文案 -->
        <div class="landing-fade-in text-center lg:text-left">
          <!-- Badge：苹果风格胶囊形 -->
          <span
            class="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 px-3.5 py-1.5 text-[12px] font-medium text-[hsl(var(--muted-foreground))] backdrop-blur-md"
            style="box-shadow: var(--shadow-xs)"
          >
            <ShieldCheck class="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
            {{ t('landing.hero.badge') }}
          </span>

          <!-- 标题：苹果式大字号 + 负字距 -->
          <h1
            class="mt-7 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[hsl(var(--foreground))] sm:text-5xl lg:text-[4.5rem]"
          >
            {{ t('landing.hero.title') }}
          </h1>

          <!-- 副标题：苹果式宽松行距 -->
          <p class="mx-auto mt-6 max-w-xl text-[19px] leading-relaxed text-[hsl(var(--muted-foreground))] lg:mx-0">
            {{ t('landing.hero.subtitle') }}
          </p>

          <!-- CTA：苹果风格按钮（圆润、轻盈悬停） -->
          <div class="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <t-button
              theme="primary"
              size="large"
              class="!h-12 !rounded-full !px-7 !text-[15px] !font-medium !shadow-md transition-all duration-300 hover:!scale-[1.02] hover:!shadow-lg active:!scale-[0.98]"
              @click="goCreate"
            >
              <Plus class="mr-1.5 h-[18px] w-[18px]" />
              {{ t('landing.hero.cta.create') }}
            </t-button>
            <t-button
              variant="outline"
              size="large"
              class="!h-12 !rounded-full !px-7 !text-[15px] !font-medium !border-[hsl(var(--border))] !text-[hsl(var(--foreground))] transition-all duration-300 hover:!bg-[hsl(var(--accent))] hover:!scale-[1.02] active:!scale-[0.98]"
              @click="goTemplates"
            >
              <LayoutTemplate class="mr-1.5 h-[18px] w-[18px]" />
              {{ t('landing.hero.cta.templates') }}
            </t-button>
          </div>
        </div>

        <!-- 右侧：简历预览示意（苹果式浮动卡片 + 多层阴影） -->
        <div class="landing-fade-in-up relative mx-auto w-full max-w-md lg:max-w-none">
          <!-- 渐变光晕：柔和、不抢戏 -->
          <div
            class="absolute -inset-8 -z-10 rounded-[40px] bg-gradient-to-tr from-[hsl(var(--primary))]/15 via-transparent to-[hsl(var(--primary))]/8 blur-[80px]"
          />
          <!-- 卡片本体：圆角加大、多层阴影、微妙边框 -->
          <div
            class="rounded-[24px] border border-[hsl(var(--border))]/60 bg-[hsl(var(--card))] p-8 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1"
            style="box-shadow: var(--shadow-xl)"
          >
            <!-- 简历头部 -->
            <div class="flex items-center gap-4 border-b border-[hsl(var(--border))] pb-5">
              <div
                class="flex h-14 w-14 items-center justify-center rounded-full text-[18px] font-bold text-[hsl(var(--primary-foreground))]"
                style="background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--ring)) 100%); box-shadow: var(--shadow-md)"
              >
                {{ t('landing.hero.preview.name').charAt(0) }}
              </div>
              <div>
                <div class="text-[18px] font-semibold tracking-[-0.022em] text-[hsl(var(--foreground))]">
                  {{ t('landing.hero.preview.name') }}
                </div>
                <div class="text-[14px] text-[hsl(var(--muted-foreground))]">
                  {{ t('landing.hero.preview.title') }}
                </div>
              </div>
            </div>

            <!-- 简历段落骨架 -->
            <div class="mt-5 space-y-5">
              <div v-for="i in 3" :key="i" class="space-y-2.5">
                <div class="h-3 w-24 rounded-full bg-[hsl(var(--primary))] opacity-80" />
                <div class="h-2 w-full rounded-full bg-[hsl(var(--muted))]" />
                <div class="h-2 w-5/6 rounded-full bg-[hsl(var(--muted))]" />
                <div class="h-2 w-4/6 rounded-full bg-[hsl(var(--muted))]" />
              </div>
            </div>

            <!-- 标签：苹果风格胶囊 -->
            <div class="mt-6 flex flex-wrap gap-2">
              <span
                v-for="tag in tags"
                :key="tag"
                class="rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-[12px] font-medium text-[hsl(var(--accent-foreground))] transition-colors hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]"
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
  // 滚动到首页的模板预览 section
  const el = document.getElementById('templates')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>
