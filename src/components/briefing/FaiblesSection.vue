<script setup lang="ts">
import type { FaibleItem } from '../../api/briefing'

defineProps<{ faibles: FaibleItem[] }>()
</script>

<template>
  <div class="faibles">
    <div class="faibles-h">
      Trois choses qui ne font pas encore les titres — le système vous les remonte avant qu'elles n'éclatent.
    </div>
    <div
      v-for="(item, i) in faibles"
      :key="item.where"
      class="faible-item"
      :class="{ 'faible-item--first': i === 0 }"
    >
      <div class="faible-where">{{ item.where }}</div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="faible-body" v-html="item.body" />
    </div>
  </div>
</template>

<style scoped>
.faibles {
  padding: 28px 32px;
  background: var(--color-bg-2);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.faibles-h {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  font-weight: var(--weight-medium);
}

.faibles-h::before {
  content: "";
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-amber);
  box-shadow: 0 0 0 3px oklch(68% 0.12 75 / 0.2);
  flex: none;
}

.faible-item {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 18px;
  padding: 14px 0;
  border-top: var(--border-rule-2);
}

.faible-item--first {
  border-top: 0;
  padding-top: 4px;
}

.faible-where {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--color-ink-3);
  padding-top: 3px;
  text-transform: uppercase;
}

.faible-body {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 15px;
  color: var(--color-ink-2);
  line-height: 1.5;
  text-wrap: pretty;
}

.faible-body :deep(b) {
  font-style: normal;
  font-family: var(--font-serif);
  font-weight: var(--weight-medium);
  color: var(--color-ink);
}
</style>
