<template>
  <div ref="molstarContainer" class="relative w-full h-full"></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import molstarConfig from '@/utils/molstar/viewer-config';
import "molstar/build/viewer/molstar.css";

const molstarContainer = ref(null);
let plugin = null;

const exampleData = {
  format: 'mmcif',
  assemblyId: '',
  isBinary: false,
  dataUrl: computed(() => `https://www.ebi.ac.uk/pdbe/static/entry/${'6XDG'.toLowerCase()}_updated.cif`),
};

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
 * Load structure data into Mol*.
 * @param {Object} plugin - The initialized plugin instance.
 */
async function load(plugin) {
  if (!plugin) {
    console.error('Plugin instance is not initialized.');
    return;
  }
  const data = await plugin.builders.data.download(
    { url: exampleData.dataUrl.value },
    { state: { isGhost: true } }
  );
  const trajectory = await plugin.builders.structure.parseTrajectory(data, exampleData.format);
  await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
}

onMounted(async () => {
  plugin = await initializePlugin();
  if (plugin) {
    console.log('Plugin initialized:', plugin);
    await load(plugin);
  }
});
</script>
