<template>
  <div class="min-h-screen">
    <UploadCSV />
    <ProteinViewer style="width: 100%; height: 600px;" />
  </div>
</template>

<script setup>
import UploadCSV from '@/components/upload/UploadCSV.vue'
import ProteinViewer from '@/components/protein/ProteinViewer.vue'
</script>
