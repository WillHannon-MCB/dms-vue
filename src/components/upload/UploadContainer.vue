<template>
  <div class="flex justify-center w-full">
    <Card class="w-full max-w-4xl" :dt="downloadCardDesignTokens">
      <template #content>
        <div class="flex flex-col gap-8 p-4">
          <UploadItem v-for="upload in uploads" :key="upload.id" :title="upload.title" :description="upload.description"
            :disabled="upload.disabled" :accept="upload.accept">
          </UploadItem>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from 'primevue/card';
import UploadItem from '@/components/upload/UploadItem.vue';

const uploads = [
  {
    id: 'csv',
    title: 'Upload your data',
    description: 'Provide your protein-based data as a <code>.csv</code> file.',
    disabled: false,
    accept: '.csv'
  },
  {
    id: 'pdb',
    title: 'Upload custom structures',
    description: '<em>Optionally</em>, Provide custom structures in <code>.pdb</code> or <code>.cif</code> format.',
    disabled: true,
    accept: '.pdb, .cif'
  },
  {
    id: 'config',
    title: 'Upload configuration file',
    description: '<em>Optionally</em>, drag and drop configuration in <code>.yaml</code> format.',
    disabled: true,
    accept: '.yaml, .yml, .json'
  }
];

const downloadCardDesignTokens = {
  shadow: '0 6px 6px -2px rgba(0, 0, 0, 0.2), 0 4px 8px 0 rgba(0, 0, 0, 0.14), 0 2px 12px 0 rgba(0, 0, 0, 0.12)',
  borderRadius: '6px'
}
</script>
