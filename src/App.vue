<!-- src/App.vue -->
<template>
  <div class="min-h-screen">
    <MainNavigation />
    <main class="container mx-auto p-5">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import MainNavigation from '@/components/layout/MainNavigation.vue'
</script>
