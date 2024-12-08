<template>
  <div class="min-h-screen flex flex-col">
    <TopMenuBar>
      <template #left>
        <TopMenuIcon></TopMenuIcon>
      </template>

      <template #center>
        <TopMenuNav></TopMenuNav>
      </template>

      <template #right>
        <TopMenuUtilities></TopMenuUtilities>
      </template>
    </TopMenuBar>

    <main class="flex-grow container mx-auto p-5 mt-6 md:mt-8 lg:mt-10 xl:mt-12">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import TopMenuBar from '@/components/common/navigation/TopMenuBar.vue'
import TopMenuNav from '@/components/common/navigation/TopMenuNav.vue'
import TopMenuIcon from '@/components/common/navigation/TopMenuIcon.vue';
import TopMenuUtilities from '@/components/common/navigation/TopMenuUtilities.vue';
</script>
