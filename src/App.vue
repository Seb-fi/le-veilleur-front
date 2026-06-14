<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'

// L'écran verrouillé (PRD #49) s'affiche plein écran, sans la coquille applicative.
const route = useRoute()
const isLocked = computed(() => route.path === '/locked')
</script>

<template>
  <RouterView v-if="isLocked" />
  <div v-else class="app-shell">
    <div class="bg-noise" aria-hidden="true" />
    <AppSidebar />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style>
.app-shell {
  display: flex;
  min-height: 100vh;
  position: relative;
}

.bg-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 .1 0 0 0 0 .1 0 0 0 0 .1 0 0 0 .04 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
}

.app-main {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}
</style>
