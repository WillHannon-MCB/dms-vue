<script setup>
import ToggleSwitch from 'primevue/toggleswitch';
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <ToggleSwitch :modelValue="isDark" @update:modelValue="toggleDark" class="dark-mode-toggle"
    aria-label="Toggle dark mode">
    <template #handle="{ checked }">
      <i :class="['!text-xs pi', { 'pi-moon': checked, 'pi-sun': !checked }]" />
    </template>
  </ToggleSwitch>
</template>
