<template>
  <div class="min-h-screen flex flex-col">
    <TopMenuBar>
      <template #left>
        <div class="flex items-center space-x-2">
          <img src="@/assets/images/logo.svg" alt="App Logo" class="h-8 w-auto" />
          <span class="font-semibold">dms-vue</span>
        </div>
      </template>

      <template #center>
        <TopMenuNav></TopMenuNav>
      </template>

      <template #right>
        <!-- <div class="flex space-x-4">
          <a href="https://your-docs-url.com" target="_blank" class="px-3 py-2 hover:text-blue-600">Docs</a>
          <a href="https://github.com/your-repo" target="_blank" class="px-3 py-2 hover:text-blue-600">GitHub</a>
        </div> -->
        <DarkModeSelector></DarkModeSelector>
      </template>
    </TopMenuBar>

    <main class="flex-grow container mx-auto p-5 mt-16">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import TopMenuBar from '@/components/common/navigation/TopMenuBar.vue'
import TopMenuNav from '@/components/common/navigation/TopMenuNav.vue'
import DarkModeSelector from '@/components/common/navigation/DarkModeSelector.vue';
</script>
