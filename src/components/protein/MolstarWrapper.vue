<template>
  <div ref="molstarContainer" class="molstar-container"></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import molstarConfig from '@/scripts/molstarConfig';
import "molstar/build/viewer/molstar.css";

const props = defineProps({
  pdbID: {
    type: String,
    required: true,
  },
  format: {
    type: String,
    default: 'mmcif',
  },
});

const molstarContainer = ref(null);

// Computed property for the data URL
const dataUrl = computed(() => `https://www.ebi.ac.uk/pdbe/static/entry/${props.pdbID}_updated.cif`);

async function createPlugin(parent) {
  const plugin = await createPluginUI({
    target: parent,
    spec: molstarConfig,
    render: renderReact18,
  });

  const data = await plugin.builders.data.download({ url: dataUrl.value }, { state: { isGhost: true } });
  const trajectory = await plugin.builders.structure.parseTrajectory(data, props.format);
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
