<!-- src/components/layout/MainNavigation.vue -->
<template>
  <Toolbar>
    <!-- Start: Logo -->
    <template #start>
      <div class="flex items-center">
        <img src="@/assets/images/logo.svg" alt="App Logo" class="h-8 w-auto mr-2" />
        <span>dms-vue</span>
      </div>
    </template>

    <!-- Center: Navigation -->
    <template #center>
      <Breadcrumb :model="navigationItems">
        <template #item="{ item }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a :href="href" @click="navigate">
              {{ item.label }}
            </a>
          </router-link>
        </template>
      </Breadcrumb>
    </template>

    <!-- End: External Links -->
    <template #end>
      <div class="flex items-center gap-3">
        <Button icon="pi pi-book" label="Docs" link @click="navigateExternal('docs')" />
        <Button icon="pi pi-github" label="GitHub" link @click="navigateExternal('github')" />
      </div>
    </template>
  </Toolbar>
</template>

<script setup>
import { ref } from 'vue'
import Toolbar from 'primevue/toolbar'
import Breadcrumb from 'primevue/breadcrumb'
import Button from 'primevue/button'

const navigationItems = ref([
  {
    label: 'Start',
    route: '/'
  },
  {
    label: 'Configure',
    route: '/configure'
  },
  {
    label: 'Visualize',
    route: '/visualize'
  },
  {
    label: 'Export',
    route: '/export'
  }
])

const externalLinks = {
  docs: 'https://your-docs-url.com',
  github: 'https://github.com/your-repo'
}

const navigateExternal = (type) => {
  window.open(externalLinks[type], '_blank')
}
</script>
