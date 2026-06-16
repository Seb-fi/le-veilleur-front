<script setup lang="ts">
import { computed } from 'vue'
import logo from '@/assets/veilleur-mark.png'

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
    <img class="mast-mark" :src="logo" alt="Le Veilleur" />
    <div class="mast-title">Le Veilleur</div>
    <div class="mast-rule" />
    <div class="mast-promise">
      <em>Rester à la pointe de votre domaine <span class="accent">sans y consacrer votre temps.</span></em>
    </div>
  </header>
</template>

<style scoped>
.masthead {
  padding: 48px 0 28px;
  border-bottom: 2px solid var(--color-ink);
  text-align: center;
}

.mast-edition {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin-bottom: 20px;
}

.mast-mark {
  width: 54px;
  height: auto;
  display: block;
  margin: 0 auto 16px;
}

.mast-title {
  font-family: var(--font-serif);
  font-size: 48px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.01em;
  line-height: 1;
  color: var(--color-ink);
}

.mast-rule {
  height: 1px;
  background: var(--color-ink);
  margin: 18px auto 18px;
  max-width: 120px;
}

.mast-promise {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 18px;
  color: var(--color-ink-2);
  max-width: 52ch;
  margin: 0 auto;
  line-height: 1.4;
  letter-spacing: -0.005em;
  text-wrap: pretty;
}

.mast-promise .accent {
  color: var(--color-amber);
  font-style: italic;
}
</style>
