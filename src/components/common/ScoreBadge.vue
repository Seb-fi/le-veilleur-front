<script setup lang="ts">
defineProps<{
  score: number
  why?: string
  compact?: boolean
}>()
</script>

<template>
  <div class="score" :class="{ 'score--compact': compact }" tabindex="0">
    <span class="score-label">Pertinence</span>
    <div class="score-bar">
      <i :style="{ width: score * 100 + '%' }" />
    </div>
    <span class="score-val">{{ score.toFixed(2) }}</span>
    <div v-if="why" class="score-why" role="tooltip">
      <div class="sw-h">Pourquoi pour vous</div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="why" />
    </div>
  </div>
</template>

<style scoped>
.score {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  position: relative;
  cursor: help;
}

.score-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.score-bar {
  width: 64px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-rule);
  position: relative;
  overflow: hidden;
}

.score-bar i {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--color-moss), var(--color-amber));
  border-radius: 2px;
  display: block;
}

.score-val {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-ink-2);
  font-variant-numeric: tabular-nums;
}

.score-why {
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  width: 300px;
  background: var(--color-ink);
  color: oklch(98% 0.008 85);
  padding: 12px 14px;
  border-radius: 5px;
  box-shadow: 0 12px 32px oklch(0% 0 0 / 0.25), 0 2px 6px oklch(0% 0 0 / 0.12);
  opacity: 0;
  visibility: hidden;
  transform: translateY(4px);
  transition: opacity 0.15s, transform 0.15s, visibility 0.15s;
  pointer-events: none;
  z-index: 50;
}

.score-why::after {
  content: "";
  position: absolute;
  top: 100%;
  right: 22px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-top-color: var(--color-ink);
}

.score-why .sw-h {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-amber);
  margin-bottom: 6px;
  font-weight: var(--weight-medium);
  display: flex;
  align-items: center;
  gap: 6px;
}

.score-why .sw-h::before {
  content: "";
  width: 14px;
  height: 1px;
  background: var(--color-amber);
}

.score-why :deep(p) {
  font-family: var(--font-serif);
  font-size: 13px;
  font-style: italic;
  line-height: 1.45;
  color: oklch(96% 0.008 85);
  text-wrap: pretty;
  margin: 0;
}

.score-why :deep(p b) {
  font-style: normal;
  font-weight: var(--weight-medium);
  color: #fff;
}

.score:hover .score-why,
.score:focus-within .score-why {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition-delay: 0.15s;
}

/* compact variant — used on acard */
.score--compact .score-bar {
  width: 48px;
}

.score--compact .score-label {
  font-size: 9.5px;
}

.score--compact .score-val {
  font-size: 10.5px;
}
</style>
