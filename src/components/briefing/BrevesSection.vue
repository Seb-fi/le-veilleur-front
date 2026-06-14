<script setup lang="ts">
import SourceBadge from '../common/SourceBadge.vue'
import type { Breve } from '../../api/briefing'

defineProps<{ breves: Breve[] }>()
</script>

<template>
  <div class="breves">
    <div
      v-for="breve in breves"
      :key="breve.title"
      class="breve"
    >
      <div class="breve-h">
        <span class="breve-kind" :class="breve.kind">{{ breve.kindLabel }}</span>
        <span>{{ breve.time }}</span>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="breve-title" v-html="breve.title" />
      <div class="breve-source">
        <SourceBadge :source="breve.source" />
        <span class="dot-sep" />
        {{ breve.category }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.breves {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 40px;
  padding-top: 8px;
}

.breve {
  padding: 18px 0;
  border-bottom: var(--border-rule);
  cursor: pointer;
  transition: opacity var(--motion-quick) var(--ease-out);
}

.breve:hover { opacity: 0.7; }

.breve-h {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-4);
}

.breve-kind {
  padding: 2px 6px;
  border-radius: 2px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.1em;
}

.breve-kind.cyber   { background: oklch(95% 0.03 25);   color: oklch(40% 0.12 25); }
.breve-kind.annonce { background: var(--color-indigo-tint); color: var(--color-indigo); }
.breve-kind.geo     { background: var(--color-amber-tint);  color: oklch(42% 0.1 65); }
.breve-kind.marche  { background: oklch(94% 0.03 155);  color: oklch(35% 0.07 155); }

.breve-title {
  font-family: var(--font-serif);
  font-size: 15.5px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.005em;
  line-height: 1.32;
  color: var(--color-ink);
  text-wrap: pretty;
}

.breve-source {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  margin-top: 8px;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot-sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-ink-4);
  flex: none;
}
</style>
