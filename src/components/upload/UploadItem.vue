<template>
  <div class="border border-[var(--p-primary-color)] rounded-md py-2 px-4">
    <Tabs value="file">
      <TabList>
        <h3 class="text-xl self-center font-bold mr-auto" :class="{ 'text-tertiary': disabled }">{{ title }}</h3>
        <Tab value="file" :disabled="disabled">File</Tab>
        <Tab value="link" :disabled="disabled">Link</Tab>
      </TabList>

      <TabPanels>
        <!-- File Upload Panel -->
        <TabPanel value="file">
          <FileUpload @upload="onAdvancedUpload($event)" :previewWidth="0" :accept="accept" :disabled="disabled"
            :maxFileSize="1000000" :dt="fileUploadDesignTokens" :pt="{
              root: { class: 'upload' }
            }">
            <template #empty>
              <span class="text-secondary" :class="{ 'text-tertiary': disabled }" v-html="description"></span>
            </template>
          </FileUpload>
        </TabPanel>

        <!-- URL Upload Panel -->
        <TabPanel value="link">
          <div class="flex flex-col gap-2">
            <InputGroup>
              <InputText v-model="fileUrl" :disabled="disabled" placeholder="Enter file URL" class="w-full" />
              <Button @click="handleUrlUpload" :disabled="!fileUrl" class="w-fit">
                Upload from URL
              </Button>
            </InputGroup>
            <span class="text-secondary" :class="{ 'text-tertiary': disabled }" v-html="description"></span>
          </div>
        </TabPanel>
      </TabPanels>

    </Tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FileUpload from 'primevue/fileupload';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import Button from 'primevue/button';

const fileUrl = ref('');

// Props definition
defineProps({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  accept: {
    type: String,
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const onAdvancedUpload = (event) => {
  console.log("Testing");
};

const handleUrlUpload = () => {
  console.log("Testing");
};

const fileUploadDesignTokens = {
  header: {
    padding: '0rem',
  },
  content: {
    padding: '0rem',
  },
}


</script>

<style scoped>
.upload {
  display: flex;
  flex-direction: column;
  border: none;
  gap: 0.5rem;
}
</style>
