<template>
  <div ref="molstarContainer" class="molstar-container"></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDataStore } from '@/stores/data';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import molstarConfig from '@/utils/molstar/viewer-config';
import CustomResidueColoring from '@/utils/molstar/custom-element';
import "molstar/build/viewer/molstar.css";

const molstarContainer = ref(null);
const dataStore = useDataStore();
console.log(dataStore.models);

// Test with fixed values
const pdbID = '6XDG';
const format = 'mmcif';

// Computed property for the data URL
const dataUrl = computed(() => `https://www.ebi.ac.uk/pdbe/static/entry/${pdbID.toLowerCase()}_updated.cif`);

async function createPlugin(parent) {
  const plugin = await createPluginUI({
    target: parent,
    spec: molstarConfig,
    render: renderReact18,
  });

  plugin.representation.structure.themes.colorThemeRegistry.add(CustomResidueColoring.colorThemeProvider);
  plugin.managers.lociLabels.addProvider(CustomResidueColoring.labelProvider);
  plugin.customModelProperties.register(CustomResidueColoring.propertyProvider, true);

  const data = await plugin.builders.data.download({ url: dataUrl.value }, { state: { isGhost: true } });
  const trajectory = await plugin.builders.structure.parseTrajectory(data, format);
  await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');

  return plugin;
}

onMounted(() => {
  if (molstarContainer.value) {
    createPlugin(molstarContainer.value);
  }
});
</script>

<style>
.molstar-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
