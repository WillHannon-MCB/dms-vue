<template>
  <div class="fixed top-0 left-0 right-0 w-full transition-colors duration-200 pointer-events-none top-menu-bar"
    :class="{ 'top-menu-bar-sticky': isScrolled }">
    <nav class="h-16 flex items-center justify-between px-4 z-50 pointer-events-auto">
      <!-- Left slot -->
      <div class="flex-1">
        <slot name="left"></slot>
      </div>

      <!-- Center slot -->
      <div class="flex-1 flex justify-center">
        <slot name="center"></slot>
      </div>

      <!-- Right slot -->
      <div class="flex-1 flex justify-end">
        <slot name="right"></slot>
      </div>
    </nav>

    <div class="top-menu-divider"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 5
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.top-menu-bar {
  background-color: transparent;
}

.top-menu-divider {
  height: 1px;
  width: 100%;
  background-color: rgb(229, 231, 235);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.top-menu-bar-sticky {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}

.top-menu-bar-sticky .top-menu-divider {
  opacity: 1;
}
</style>
