<script setup lang="ts">
import type { Apercu } from '../../types'

defineProps<{ apercu: Apercu | null; loading?: boolean }>()
</script>

<template>
  <div class="apercu">
    <ol v-if="apercu && apercu.results.length" class="ap-list">
      <li v-for="(r, i) in apercu.results" :key="r.articleId" class="ap-row">
        <span class="ap-rank">{{ String(i + 1).padStart(2, '0') }}</span>
        <div class="ap-body">
          <div class="ap-title">{{ r.titre }}</div>
          <div class="ap-source">{{ r.source }} · {{ r.date }}</div>
        </div>
        <div class="ap-score">
          <span class="ap-bar"><span class="ap-fill" :style="{ width: `${r.score}%` }" /></span>
          <span class="ap-num">{{ r.score }}</span>
        </div>
      </li>
    </ol>

    <p v-else-if="loading" class="ap-empty">Recherche des sources…</p>

    <p v-else class="ap-empty">
      Aucune source pertinente pour cette intention. Affinez le descriptif —
      l'aperçu montrera ce qui remonte vraiment.
    </p>
  </div>
</template>

<style scoped>
.ap-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.ap-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--color-rule-2);
}
.ap-row:last-child {
  border-bottom: none;
}
.ap-rank {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  flex: none;
  font-variant-numeric: tabular-nums;
}
.ap-body {
  flex: 1;
  min-width: 0;
}
.ap-title {
  font-family: var(--font-serif);
  font-size: 14px;
  line-height: 1.3;
  color: var(--color-ink);
}
.ap-source {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-top: 3px;
}
.ap-score {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}
.ap-bar {
  width: 48px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-moss-tint);
  overflow: hidden;
}
.ap-fill {
  display: block;
  height: 100%;
  background: var(--color-moss);
}
.ap-num {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-ink-3);
  width: 18px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.ap-empty {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--color-ink-4);
  padding: 18px 0;
}
</style>
