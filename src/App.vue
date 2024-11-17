<script setup>
import { ref } from "vue";
import ProteinViewer from './protein/ProteinViewer.vue';
import UploadCSV from '@/upload/UploadCSV.vue';

const pdbID = '6XDG';

// This state will store the parsed CSV data
const csvData = ref(null);

// Callback function to handle the parsed CSV data
function handleCsvProcessed(data) {
  csvData.value = data;
}
</script>

<template>
  <main>
    <!-- CSV Upload Section -->
    <UploadCSV @csv-processed="handleCsvProcessed" />
    <!-- Protein Viewer -->
    <ProteinViewer :pdbID="pdbID" style="width: 100%; height: 600px;" />
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
}
</style>
