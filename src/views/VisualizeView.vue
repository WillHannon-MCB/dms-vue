<template>
  <VisualizeLayout>
    <UploadCSV />
    <ProteinViewer style="width: 100%; height: 600px;" />
  </VisualizeLayout>
</template>

<script setup>
import VisualizeLayout from '@/components/layout/VisualizeLayout.vue';
import UploadCSV from '@/components/upload/UploadCSV.vue'
import ProteinViewer from '@/components/protein/ProteinViewer.vue'
</script>
