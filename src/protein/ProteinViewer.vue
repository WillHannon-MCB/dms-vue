<template>
  <div ref="molstarContainer" class="relative w-full h-full"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { Asset } from 'molstar/lib/mol-util/assets';
import { useDataStore } from "@/stores/data";
import { useConfigStore } from "@/stores/config";
import { useColorStore } from '@/stores/color';
import molstarConfig from '@/utils/molstar/viewer-config';
import "molstar/build/viewer/molstar.css";

const molstarContainer = ref(null);
let plugin = null;
const dataStore = useDataStore();
const configStore = useConfigStore();
const colorStore = useColorStore();

/**
 * Initializes the Mol* plugin.
 * @returns {Promise<Object>} The initialized plugin instance.
 */
async function initializePlugin() {
  if (!molstarContainer.value) {
    console.error('Molstar container is not available.');
    return null;
  }

  const plugin = await createPluginUI({
    target: molstarContainer.value,
    spec: molstarConfig,
    render: renderReact18,
  });

  return plugin;
}

/**
 * Load multiple structures into Mol*.
 * @param {Object} plugin - The initialized plugin instance.
 * @param {Array} structures - An array of structure loading options.
 */
async function load(plugin, structures) {
  if (!plugin) {
    console.error('Plugin instance is not initialized.');
    return;
  }

  plugin.clear();

  for (const { url, format = 'mmcif', assemblyId = '', isBinary = false } of structures) {
    try {
      // Step 1: Download the data
      const data = await plugin.builders.data.download(
        { url: Asset.Url(url), isBinary },
        { state: { isGhost: true } }
      );

      // Step 2: Parse the trajectory
      const trajectory = await plugin.builders.structure.parseTrajectory(data, format);

      // Step 3: Apply the hierarchy preset
      await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default', {
        structure: assemblyId ? {
          name: 'assembly',
          params: { id: assemblyId }
        } : {
          name: 'model',
          params: {}
        },
        showUnitcell: false,
        representationPreset: 'auto'
      });

      console.log(`Successfully loaded structure from ${url}`);
    } catch (error) {
      console.error(`Failed to load structure from ${url}:`, error);
    }
  }
}

onMounted(async () => {
  plugin = await initializePlugin();
});

watch(() => dataStore.structures, (newStructures) => {
  if (plugin) {
    load(plugin, newStructures);
  }
});

watch(() => colorStore.customElements, (customElements) => {
  if (plugin && customElements) {
    Object.values(customElements).forEach((customElement) => {
      plugin.representation.structure.themes.colorThemeRegistry.add(customElement.colorThemeProvider);
      plugin.managers.lociLabels.addProvider(customElement.labelProvider);
      plugin.customModelProperties.register(customElement.propertyProvider, true);
    });
  }
}, { deep: true });

watch(
  [() => dataStore.rawData, () => configStore.residueColumns],
  ([rawData, residueColumns]) => {
    if (rawData && residueColumns.length) {
      colorStore.generateCustomElements();
    }
  }
);


</script>
