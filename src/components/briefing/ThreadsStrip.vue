<script setup lang="ts">
import type { StripThread } from '../../stores/useThreadsStore'

defineProps<{ threads: StripThread[] }>()
const emit = defineEmits<{ select: [dossierId: string] }>()

// Palier de cohésion → libellé + classe (gate de cohésion Phase 2 ; seuils miroir de cohesion_gate).
function tier(cohesion: number | null): { label: string; cls: string } {
  if (cohesion === null) return { label: 'cohésion n/a', cls: 'steady' }
  if (cohesion >= 0.52) return { label: 'histoire serrée', cls: 'rising' }
  if (cohesion <= 0.42) return { label: 'diffus', cls: 'shift' }
  return { label: 'à surveiller', cls: 'deep' }
}
</script>

<template>
  <section class="threads">
    <div class="threads-h">
      — <span class="threads-h__accent">Ce que le système suit pour vous</span> · {{ threads.length }} fils actifs —
    </div>

    <div class="threads-grid">
      <div
        v-for="(thread, i) in threads"
        :key="thread.dossierId"
        class="thread"
        :class="{ 'thread--first': i === 0 }"
        role="button"
        tabindex="0"
        @click="emit('select', thread.dossierId)"
        @keydown.enter="emit('select', thread.dossierId)"
      >
        <div class="thread-status" :class="`thread-status--${tier(thread.cohesion).cls}`">
          {{ tier(thread.cohesion).label }}
        </div>
        <h4 class="thread-name">{{ thread.name }}</h4>
        <div class="thread-meta">
          <span v-if="thread.anchor && thread.anchor !== thread.name">{{ thread.anchor }} · </span>
          <b>{{ thread.sourceCount }}</b> source{{ thread.sourceCount > 1 ? 's' : '' }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.threads {
  padding: 40px 0 44px;
  border-bottom: var(--border-rule);
}

.threads-h {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  font-weight: var(--weight-medium);
}

.threads-h::before,
.threads-h::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-rule);
}

.threads-h__accent { color: var(--color-indigo); }

.threads-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}

.thread {
  padding: 0 24px;
  border-left: var(--border-rule-2);
  cursor: pointer;
  transition: opacity var(--motion-quick) var(--ease-out);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.thread--first {
  border-left: 0;
  padding-left: 0;
}

.thread:last-child { padding-right: 0; }
.thread:hover { opacity: 0.65; }

.thread-status {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: var(--weight-medium);
  display: flex;
  align-items: center;
  gap: 7px;
}

.thread-status::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  flex: none;
}

.thread-status--shift  { color: var(--color-amber); }
.thread-status--rising { color: var(--color-moss); }
.thread-status--steady { color: var(--color-ink-3); }
.thread-status--deep   { color: var(--color-indigo); }

.thread-name {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.008em;
  line-height: 1.15;
  text-wrap: pretty;
  color: var(--color-ink);
}

.thread-meta {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.04em;
  margin-top: auto;
  padding-top: 6px;
}

.thread-meta b {
  color: var(--color-ink-2);
  font-weight: var(--weight-medium);
}
</style>
