// Pinia 持久化插件注册
// 注意：当前项目通过 `pinia-plugin-persistedstate/nuxt` 模块自动注册持久化插件，
// 该模块会自动注入 `piniaPluginPersistedstate` 全局辅助函数（指向 storages）。
// 此文件保留为占位，便于后续扩展自定义 Pinia 插件。
export default defineNuxtPlugin(() => {
  // 由 `pinia-plugin-persistedstate/nuxt` 模块自动完成注册，此处无需重复注册
})
