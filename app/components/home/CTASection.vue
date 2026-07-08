<template>
  <section class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- 苹果风格大色块：更大圆角、柔和渐变、精致装饰光斑 -->
      <div
        class="relative overflow-hidden rounded-[32px] px-8 py-20 text-center sm:px-16 sm:py-24"
        style="background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--ring)) 100%); box-shadow: var(--shadow-xl)"
      >
        <!-- 装饰光斑：苹果式柔和模糊圆 -->
        <div
          class="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/15 blur-[100px]"
        />
        <div
          class="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-[100px]"
        />
        <!-- 顶部高光：模拟苹果产品页的光线效果 -->
        <div
          class="absolute left-1/2 top-0 h-40 w-[600px] -translate-x-1/2 rounded-full bg-white/20 blur-[60px]"
        />

        <div class="landing-fade-in relative">
          <h2 class="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-4xl">
            {{ t('landing.cta.title') }}
          </h2>
          <p class="mx-auto mt-5 max-w-xl text-[18px] leading-relaxed text-white/85 sm:text-[19px]">
            {{ t('landing.cta.subtitle') }}
          </p>
          <div class="mt-10 flex justify-center">
            <t-button
              size="large"
              class="!h-12 !rounded-full !bg-white !px-8 !text-[15px] !font-semibold !text-[hsl(var(--primary))] !shadow-lg transition-all duration-300 hover:!scale-[1.03] hover:!shadow-xl active:!scale-[0.98]"
              @click="goDashboard"
            >
              {{ t('landing.cta.button') }}
              <ArrowRight class="ml-1.5 h-[18px] w-[18px]" />
            </t-button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
const localePath = useLocalePath()

const goDashboard = () => router.push(localePath('/dashboard'))
</script>
