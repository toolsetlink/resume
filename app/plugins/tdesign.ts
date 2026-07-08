// TDesign 全局注册
import TDesign from 'tdesign-vue-next'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(TDesign)
})
