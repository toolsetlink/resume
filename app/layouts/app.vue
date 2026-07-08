<template>
  <div class="app-layout min-h-screen bg-[hsl(var(--bg-base))]">
    <slot />
  </div>
</template>

<script setup lang="ts">
// 应用布局：dashboard / workbench 等应用内页面使用此布局
// 这些页面是用户私有数据界面，不应被搜索引擎索引
useSeoMeta({
  robots: 'noindex, nofollow',
})
</script>
