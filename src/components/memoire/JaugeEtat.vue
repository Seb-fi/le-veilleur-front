<script setup lang="ts">
import { computed } from 'vue'
import type { ApercuState } from '../../types'

const props = defineProps<{ state: ApercuState | null }>()

// Jauge en 3 états bornés (PRD §4.5/§7) : lue uniquement depuis apercu.state.
// Aucune analyse du texte ; pas de barre à poids d'autorité. Microcopy « indicatif ».
const view = computed(() => {
  switch (props.state) {
    case 'SIGNAL_NET':
      return { tone: 'net', label: 'Sources reliées trouvées' }
    case 'SIGNAL_FAIBLE':
      return { tone: 'faible', label: 'Peu de sources reliées' }
    default:
      return { tone: 'aucune', label: 'Aucune source reliée pour l’instant' }
  }
})
</script>

<template>
  <div class="qmeter" :class="`is-${view.tone}`" role="status">
    <span class="q-dot" />
    <span class="q-label">{{ view.label }}</span>
    <span class="q-hint">indicatif — c'est l'aperçu qui montre vraiment ce qui remonte</span>
  </div>
</template>

<style scoped>
.qmeter {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}
.q-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
  background: var(--color-ink-4);
}
.is-net .q-dot {
  background: var(--color-moss);
}
.is-faible .q-dot {
  background: var(--color-amber);
}
.is-aucune .q-dot {
  background: var(--color-ink-4);
}
.q-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-2);
}
.q-hint {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 12px;
  color: var(--color-ink-4);
}
</style>
