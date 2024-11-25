<script setup>
import ProteinViewer from '@/components/protein/ProteinViewer.vue';
import UploadCSV from '@/components/upload/UploadCSV.vue';
</script>

<template>
  <main>
    <!-- CSV Upload Section -->
    <UploadCSV />
    <!-- Protein Viewer -->
    <ProteinViewer style="width: 100%; height: 600px;" />
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
