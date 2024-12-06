<template>
  <div class="flex items-center gap-2">
    <!-- Links Group -->
    <div class="flex items-center gap-1">
      <Button label="Documentation" variant="link" class="no-underline" :class="'button-link'"
        @click="navigateExternal('https://vitepress.dev/')">
      </Button>

      <Button label="About" variant="link" class="no-underline" :class="'button-link'"
        @click="navigateExternal('https://jbloomlab.org/')">
      </Button>
    </div>

    <Divider layout="vertical" />

    <!-- Socials -->
    <div class="flex items-center gap-">
      <Button icon="pi pi-github" variant="text" rounded :class="'button-social'"
        @click="navigateExternal('https://github.com/WillHannon-MCB/dms-vue')">
      </Button>

      <Button icon="pi pi-twitter" variant="text" :class="'button-link'" rounded
        @click="navigateExternal('https://x.com/jbloom_lab?lang=en')">
      </Button>
    </div>

    <Divider layout="vertical" />

    <!-- Dark Mode Toggle -->
    <DarkModeSelector />
  </div>
</template>


<script setup>
import DarkModeSelector from '@/components/common/navigation/DarkModeSelector.vue';
import Button from 'primevue/button';
import Divider from 'primevue/divider';

const navigateExternal = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
</script>

<style scoped>
.button-link {
  @apply text-base font-semibold p-2 text-[var(--text-primary)] !important;
}

.button-social {
  @apply text-[var(--text-primary)] p-2 !important;
}

:deep .button-social .pi {
  @apply text-xl !important;
}
</style>
