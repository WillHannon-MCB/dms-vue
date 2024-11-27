<template>
  <div class="p-4 bg-white">
    <h2 class="text-lg font-semibold mb-4">Upload Your CSV:</h2>
    <form @submit.prevent="uploadFile" class="flex items-center gap-4 border border-gray-300 rounded-lg p-2">
      <div class="relative flex-grow">
        <label for="file-upload"
          class="block px-4 py-2 bg-gray-100 text-gray-900 rounded-lg cursor-pointer border border-gray-300 focus:ring focus:ring-blue-300 hover:bg-gray-200">
          Choose File
        </label>
        <input id="file-upload" type="file" accept=".csv" @change="handleFileSelect"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>

      <div class="flex-grow text-sm bg-gray-50 px-4 py-2 rounded-md border border-gray-300">
        {{ fileName }}
      </div>

      <button type="submit" :disabled="!file"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring focus:ring-blue-300">
        Upload
      </button>
    </form>

    <p v-if="store.status.message" :class="store.status.type === 'success' ? 'text-green-500' : 'text-red-500'"
      class="mt-4">
      {{ store.status.message }}
    </p>
  </div>
</template>

<script setup>
import { useDataStore } from '@/stores/data'
import { useFileUpload } from '@/composables/useDataUpload'

const store = useDataStore()
const { file, fileName, handleFileSelect, uploadFile } = useFileUpload()
</script>
