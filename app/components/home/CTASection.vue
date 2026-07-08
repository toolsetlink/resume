<template>
  <section class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        class="relative overflow-hidden rounded-[12px] bg-[hsl(var(--brand))] px-8 py-20 text-center sm:px-16 sm:py-24"
        style="box-shadow: var(--shadow-lg)"
      >
        <div class="fade-in relative">
          <h2 class="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] text-white sm:text-4xl">
            {{ t('landing.cta.title') }}
          </h2>
          <p class="mx-auto mt-5 max-w-xl text-[18px] leading-relaxed text-white/85 sm:text-[19px]">
            {{ t('landing.cta.subtitle') }}
          </p>
          <div class="mt-10 flex justify-center">
            <t-button
              size="large"
              class="!h-12 !bg-white !px-8 !text-[15px] !font-semibold !text-[hsl(var(--brand))] transition-all duration-200 hover:!scale-[1.02] active:!scale-[0.98]"
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
