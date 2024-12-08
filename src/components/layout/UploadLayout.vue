<template>
  <div class="flex flex-col space-y-4 md:space-y-6 lg:space-y-8">
    <header class="pb-4 select-none">
      <div class="text-center">
        <h1 class="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight">
          Welcome to
          <span class="inline-flex items-start relative">
            <span class="font-bold title">dms-vue</span>
            <sup
              class="text-xs md:text-sm text-tertiary tracking-normal absolute right-0 top-2 translate-x-full">v0.0.0beta</sup>
          </span>
        </h1>
        <p class="mt-4 text-xl lg:text-2xl text-semibold text-secondary">
          Explore, annotate, and analyze protein-based data with ease.
        </p>
      </div>
    </header>
    <div class="flex-grow">
      <UploadContainer></UploadContainer>
    </div>
  </div>
</template>

<script setup>
import UploadContainer from '@/components/upload/UploadContainer.vue';
</script>

<style scoped>
.title {
  background: -webkit-linear-gradient(120deg, var(--brand-gradient-from) 30%, var(--brand-gradient-to) 70%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
