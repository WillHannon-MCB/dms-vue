<script setup>
import MolstarWrapper from './components/protein/MolstarWrapper.vue';

const pdbID = '6XDG';
</script>

<template>
  <header>
    <h1>Protein Structure Viewer</h1>
  </header>
  <main>
    <MolstarWrapper :pdbID="pdbID" style="width: 100%; height: 600px;" />
  </main>
</template>

<style scoped>
header {
  text-align: center;
  padding: 20px;
}

main {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
