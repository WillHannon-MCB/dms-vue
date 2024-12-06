<template>
  <div class="flex flex-col space-y-8">
    <header class="pb-4 select-none">
      <div class="text-center">
        <h1 class="text-8xl font-light tracking-tight">
          Welcome to
          <span class="inline-flex items-start relative">
            <span class="font-bold title">dms-vue</span>
            <sup class="text-sm text-tertiary tracking-normal absolute right-0 top-2 translate-x-full">v0.0.0beta</sup>
          </span>
        </h1>
        <p class="mt-4 text-2xl text-semibold text-secondary">
          Explore, annotate, and analyze protein-based data with ease.
        </p>
      </div>
    </header>
    <div class="flex-grow">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.title {
  background: -webkit-linear-gradient(120deg, var(--brand-gradient-from) 30%, var(--brand-gradient-to) 70%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
