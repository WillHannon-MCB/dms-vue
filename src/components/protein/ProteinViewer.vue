<!-- components/MolstarViewer.vue -->
<template>
  <div class="relative w-full h-full">
    <!-- Error display -->
    <div v-if="error" class="absolute top-0 left-0 right-0 z-50 p-4 bg-red-100 text-red-700">
      {{ error.message }}
      <button @click="clearError" class="ml-2 text-sm underline">Dismiss</button>
    </div>

    <!-- Plugin container -->
    <div ref="molstarContainer" class="w-full h-full"></div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMolstarPlugin } from '@/composables/useMolstarPlugin'
import { useMolstarColoring } from '@/composables/useMolstarColoring';
import "molstar/build/viewer/molstar.css"

const molstarContainer = ref(null)
const {
  error,
  clearError,
} = useMolstarPlugin(molstarContainer)
useMolstarColoring()

</script>
