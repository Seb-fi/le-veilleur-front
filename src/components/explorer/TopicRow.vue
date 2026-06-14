<script setup lang="ts">
import type { Topic } from '../../api/explorer'

defineProps<{ topic: Topic; index: number }>()
</script>

<template>
  <div class="topic-row">
    <span class="num">{{ String(index + 1).padStart(2, '0') }}</span>
    <div class="label-col">
      <span class="label">{{ topic.name }}</span>
      <span class="axis">{{ topic.axis }}</span>
    </div>
    <span class="articles">{{ topic.articleCount }} art.</span>
    <span
      v-if="topic.delta !== undefined"
      class="delta"
      :class="topic.delta >= 0 ? 'up' : 'down'"
    >
      {{ topic.delta >= 0 ? '+' : '' }}{{ topic.delta }}%
    </span>
    <span v-else class="delta" />
    <div class="maturity">
      <i v-for="n in 5" :key="n" :class="{ on: n <= topic.maturity }" />
    </div>
  </div>
</template>

<style scoped>
.topic-row {
  display: grid;
  grid-template-columns: 32px 1fr 80px 60px 60px;
  gap: 20px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-rule-2);
  cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out);
}

.topic-row:hover { background: var(--color-bg-2); }

.num {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-ink-4);
  font-variant-numeric: tabular-nums;
}

.label-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.label {
  font-family: var(--font-serif);
  font-size: 15.5px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.005em;
  color: var(--color-ink);
}

.axis {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.articles {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-ink-2);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.delta {
  font-family: var(--font-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.delta.up   { color: var(--color-moss); }
.delta.down { color: var(--color-rose); }

.maturity {
  display: flex;
  gap: 2px;
}

.maturity i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-rule);
}

.maturity i.on { background: var(--color-indigo); }
</style>
