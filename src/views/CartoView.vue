<script setup lang="ts">
import { onMounted } from 'vue'
import { useExplorerStore } from '../stores/useExplorerStore'
import CartoGraph from '../components/explorer/CartoGraph.vue'

const store = useExplorerStore()
onMounted(() => store.loadCarto())
</script>

<template>
  <div class="carto-view">
    <div v-if="store.cartoLoading" class="loading">
      <span>Chargement…</span>
    </div>
    <CartoGraph v-else-if="store.carto" :data="store.carto" />
  </div>
</template>

<style scoped>
.carto-view {
  overflow: hidden;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: var(--font-mono);
  font-size: var(--type-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-ink-4);
}
</style>
