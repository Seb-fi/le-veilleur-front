<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  edition: number
  date: string
  time: string
}>()

// Ligne d'en-tête composée des seuls éléments disponibles (édition/heure non
// suivis côté backend → masqués en mode réel).
const editionLine = computed(() =>
  [props.edition ? `Édition n°${props.edition}` : '', props.date, props.time]
    .filter(Boolean)
    .join(' · '),
)
</script>

<template>
  <header class="masthead">
    <div class="mast-edition">{{ editionLine }}</div>
    <div class="mast-title">Le <em>Veilleur</em></div>
    <div class="mast-rule" />
    <div class="mast-promise"><em>Rester à la pointe de votre domaine sans y consacrer votre temps.</em></div>
  </header>
</template>

<style scoped>
.masthead {
  padding: 56px 0 28px;
  border-bottom: 2px solid var(--color-ink);
  text-align: center;
}

.mast-edition {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin-bottom: 18px;
}

.mast-title {
  font-family: var(--font-serif);
  font-size: 56px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.024em;
  line-height: 1;
  color: var(--color-ink);
}

.mast-title em {
  font-style: italic;
  font-weight: var(--weight-regular);
  color: var(--color-indigo);
}

.mast-rule {
  height: 1px;
  background: var(--color-ink);
  margin: 14px auto 18px;
  max-width: 120px;
}

.mast-promise {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 18px;
  color: var(--color-ink-2);
  max-width: 50ch;
  margin: 0 auto;
  line-height: 1.4;
  letter-spacing: -0.005em;
  text-wrap: pretty;
}
</style>
