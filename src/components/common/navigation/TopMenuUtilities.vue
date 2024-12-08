<template>
  <div class="hidden xl:flex items-center gap-1">
    <!-- Links Group -->
    <div class="flex items-center gap-1">
      <Button label="Documentation" variant="link" class="no-underline" :class="'button-link'"
        @click="navigateExternal('https://vitepress.dev/')">
      </Button>

      <Button label="About" variant="link" class="no-underline" :class="'button-link'"
        @click="navigateExternal('https://jbloomlab.org/')">
      </Button>
    </div>

    <Divider :class="'divider-vertical'" layout="vertical" />

    <!-- Socials -->
    <div class="flex items-center gap-">
      <Button icon="pi pi-github" variant="text" rounded :class="'button-social'"
        @click="navigateExternal('https://github.com/WillHannon-MCB/dms-vue')">
      </Button>

      <Button icon="pi pi-twitter" variant="text" :class="'button-link'" rounded
        @click="navigateExternal('https://x.com/jbloom_lab?lang=en')">
      </Button>
    </div>

    <Divider :class="'divider-vertical'" layout="vertical" />

    <!-- Dark Mode Toggle -->
    <div class="flex justify-center items-center px-2">
      <DarkModeSelector />
    </div>
  </div>
  <div class="block xl:hidden relative">
    <Button icon="pi pi-align-justify" aria-label="Menu" :dt="menuButtonDesignTokens" @click="toggleMenu"
      :aria-expanded="isMenuOpen" />
  </div>
</template>


<script setup>
import DarkModeSelector from '@/components/common/navigation/DarkModeSelector.vue';
import Button from 'primevue/button';
import Divider from 'primevue/divider';

const navigateExternal = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const menuButtonDesignTokens = {
  padding: {
    y: ".25rem",
  },
  iconOnlyWidth: "2rem",
}
</script>

<style scoped>
.button-link {
  @apply text-base font-semibold p-1 text-[var(--text-primary)] !important;
}

.button-social {
  @apply text-[var(--text-primary)] p-1 !important;
}

:deep .button-social .pi {
  @apply text-xl !important;
}

.divider-vertical {
  @apply m-1 !important;
}
</style>
