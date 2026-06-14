<script setup lang="ts">
const props = defineProps<{
  name: string
  sourcesScanned: number
  signalCount: number
  readMinutes: number
  activeThread: { topic: string; days: number; shift: string }
}>()

// Métadonnées d'en-tête (sources/signaux/minutes) et panneau « fil » : affichés
// seulement quand on a la donnée — masqués en mode réel (non exposés backend).
const hasStats = props.sourcesScanned > 0
const hasActiveThread = !!props.activeThread.topic
</script>

<template>
  <section class="brief-greet" :class="{ 'brief-greet--solo': !hasActiveThread }">
    <div>
      <div class="bg-eyebrow">Briefing du matin</div>
      <h1 class="bg-hello">Bonjour<template v-if="name"> <em>{{ name }}</em></template>.</h1>
      <p v-if="hasStats" class="bg-state">
        Le système a parcouru <b>{{ sourcesScanned }} sources</b> cette nuit.
        <b>{{ signalCount === 5 ? 'Cinq' : signalCount + ' signaux' }}</b> demandent votre attention —
        <b>{{ readMinutes }} minutes</b> pour les comprendre, le temps d'un trajet.
      </p>
    </div>

    <div v-if="hasActiveThread" class="bg-r">
      <div class="bg-thread-h">
        <span class="bg-thread-dot" />
        Le fil que vous suivez
      </div>
      <p>
        Vous lisez sur <b>{{ activeThread.topic }}</b> depuis <b>{{ activeThread.days }} jours</b>.
        La dynamique <em>{{ activeThread.shift }}</em> cette nuit — c'est aujourd'hui votre sujet.
      </p>
    </div>
  </section>
</template>

<style scoped>
.brief-greet {
  padding: 52px 0 44px;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 64px;
  align-items: end;
  border-bottom: var(--border-rule);
}

.brief-greet--solo {
  grid-template-columns: 1fr;
}

.bg-eyebrow {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.bg-eyebrow::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-rule);
}

.bg-hello {
  font-family: var(--font-serif);
  font-size: 52px;
  font-weight: var(--weight-regular);
  letter-spacing: -0.025em;
  line-height: 1.02;
  margin-bottom: 20px;
  text-wrap: pretty;
}

.bg-hello em {
  font-style: italic;
  color: var(--color-indigo);
  font-weight: var(--weight-regular);
}

.bg-state {
  font-family: var(--font-serif);
  font-size: 19px;
  line-height: 1.5;
  color: var(--color-ink-2);
  max-width: 46ch;
  text-wrap: pretty;
  font-weight: var(--weight-light);
}

.bg-state b {
  font-weight: var(--weight-medium);
  color: var(--color-ink);
  font-family: var(--font-serif);
}

.bg-r {
  padding: 6px 0 6px 32px;
  border-left: var(--border-rule);
  position: relative;
}

.bg-thread-h {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-indigo);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: var(--weight-medium);
}

.bg-thread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-indigo);
  box-shadow: 0 0 0 3px oklch(38% 0.09 265 / 0.18);
  animation: pulse 2.4s infinite ease-in-out;
  flex: none;
}

.bg-r p {
  font-family: var(--font-serif);
  font-size: 15.5px;
  line-height: 1.55;
  color: var(--color-ink-2);
  text-wrap: pretty;
}

.bg-r p b {
  color: var(--color-ink);
  font-weight: var(--weight-medium);
  font-style: normal;
}

.bg-r p em {
  font-style: italic;
  color: var(--color-amber);
  font-weight: var(--weight-medium);
}
</style>
