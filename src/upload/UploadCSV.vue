<template>
  <div class="p-4 bg-white">
    <h2 class="text-lg font-semibold mb-4">Upload Your CSV:</h2>
    <form @submit.prevent="handleFileUpload" class="flex items-center gap-4 border border-gray-300 rounded-lg p-2">
      <div class="relative flex-grow">
        <label for="file-upload"
          class="block px-4 py-2 bg-gray-100 text-gray-900 rounded-lg cursor-pointer border border-gray-300 focus:ring focus:ring-blue-300 hover:bg-gray-200">
          Choose File
        </label>
        <input id="file-upload" type="file" accept=".csv" @change="onFileChange"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>

      <div class="flex-grow text-gray-700 text-sm bg-gray-50 px-4 py-2 rounded-md border border-gray-300">
        {{ selectedFileName || "No file chosen" }}
      </div>

      <button type="submit"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring focus:ring-blue-300"
        :disabled="!selectedFile">
        Upload
      </button>
    </form>

    <p v-if="store.successMessage" class="mt-4 text-green-500">{{ store.successMessage }}</p>
    <p v-if="store.errorMessage" class="mt-4 text-red-500">{{ store.errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useDataStore } from "@/stores/data";

// Store and reactive references
const store = useDataStore();
const selectedFile = ref(null);
const selectedFileName = ref("No file chosen");

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type === "text/csv") {
    selectedFile.value = file;
    selectedFileName.value = file.name;
  } else {
    selectedFile.value = null;
    selectedFileName.value = "No file chosen";
  }
};

const handleFileUpload = async () => {
  if (!selectedFile.value) return;

  try {
    const text = await selectedFile.value.text();
    const fileName = selectedFile.value.name;

    await store.uploadData(text, [], fileName);

    selectedFile.value = null;
  } catch (error) {
    selectedFileName.value = "No file chosen";
    console.error("Failed to upload CSV:", error.message);
  }
};
</script>
