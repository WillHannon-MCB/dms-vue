<template>
  <div class="fixed top-0 left-0 right-0 w-full pointer-events-none top-menu-bar"
    :class="{ 'top-menu-bar-sticky': isScrolled }">
    <nav class="h-16 flex items-center justify-between px-10 z-50 pointer-events-auto">
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
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.top-menu-bar-sticky {
  background-color: var(--nav-background-sticky);
  backdrop-filter: blur(10px);
  border-bottom-color: var(--nav-divider);
}
</style>
