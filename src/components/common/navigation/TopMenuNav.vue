<template>
  <Breadcrumb :model="navigationItems" :pt="{
    root: { class: 'breadcrumb' }
  }">
    <template #item="{ item, props }">
      <Button as="router-link" :to="item.route" :label="item.label" :icon="item.icon"
        :class="[props.action.class, 'button', { 'active': isActiveRoute(item.route) }]" variant="outlined" size="small"
        raised />
    </template>
  </Breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from 'primevue/breadcrumb';
import Button from 'primevue/button';

const route = useRoute()

const navigationRoutes = [
  { path: '/', name: 'Upload', icon: 'pi pi-upload' },
  { path: '/configure', name: 'Configure', icon: 'pi pi-cog' },
  { path: '/visualize', name: 'Visualize', icon: 'pi pi-eye' },
  { path: '/export', name: 'Export', icon: 'pi pi-download' }
]

const navigationItems = computed(() =>
  navigationRoutes.map(route => ({
    label: route.name,
    route: route.path,
    icon: route.icon
  }))
)

const isActiveRoute = (path) => {
  return route.path === path
}
</script>

<style scoped>
.breadcrumb {
  @apply bg-inherit
}

.button {
  @apply text-base font-semibold text-[var(--nav-c-text)] p-2;
}

.active {
  background: var(--p-button-outlined-primary-hover-background);
  color: var(--p-button-outlined-primary-color);
  border-color: var(--p-button-outlined-primary-border-color);
}
</style>
