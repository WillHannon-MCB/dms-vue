<template>
  <Breadcrumb :model="navigationItems">
    <template #item="{ item, props }">
      <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a :href="href" v-bind="props.action" @click="navigate">
          <span class="font-medium">{{ item.label }}</span>
        </a>
      </RouterLink>
      <a v-else :href="item.url" :target="item.target" v-bind="props.action">
        <span>{{ item.label }}</span>
      </a>
    </template>
  </Breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import Breadcrumb from 'primevue/breadcrumb';

const navigationRoutes = [
  { path: '/', name: 'Upload' },
  { path: '/configure', name: 'Configure' },
  { path: '/visualize', name: 'Visualize' },
  { path: '/export', name: 'Export' }
]

const navigationItems = computed(() =>
  navigationRoutes.map(route => ({
    label: route.name,
    route: route.path
  }))
)
</script>
