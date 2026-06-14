<script setup lang="ts">
import type { Thread } from '../../api/briefing'

defineProps<{ threads: Thread[] }>()

function sparkPath(points: number[]): string {
  const w = 100, h = 28
  const max = Math.max(...points)
  const min = Math.min(...points)
  const dx = w / (points.length - 1)
  return points
    .map((v, i) => {
      const x = i * dx
      const y = h - ((v - min) / Math.max(0.001, max - min)) * h
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

const STATUS_COLORS: Record<string, string> = {
  shift:  'oklch(68% 0.12 75)',
  rising: 'oklch(52% 0.075 155)',
  deep:   'oklch(38% 0.09 265)',
  steady: 'oklch(55% 0.008 270)',
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
        :key="thread.name"
        class="thread"
        :class="{ 'thread--first': i === 0 }"
      >
        <div class="thread-status" :class="`thread-status--${thread.status}`">
          {{ thread.statusLabel }}
        </div>
        <h4 class="thread-name">{{ thread.name }}</h4>
        <div class="thread-meta">
          Suivi depuis <b>{{ thread.daysTracked }} jours</b> · {{ thread.articleCount }} articles
        </div>
        <svg class="thread-spark" viewBox="0 0 100 28" preserveAspectRatio="none">
          <path
            :d="sparkPath(thread.sparkPoints)"
            fill="none"
            :stroke="STATUS_COLORS[thread.status]"
            stroke-width="1.3"
          />
          <circle
            :cx="100"
            :cy="thread.sparkPoints[thread.sparkPoints.length - 1] !== undefined
              ? 28 - ((thread.sparkPoints[thread.sparkPoints.length - 1] - Math.min(...thread.sparkPoints)) /
                  Math.max(0.001, Math.max(...thread.sparkPoints) - Math.min(...thread.sparkPoints))) * 28
              : 14"
            r="2.5"
            :fill="STATUS_COLORS[thread.status]"
          />
        </svg>
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
}

.thread-meta b {
  color: var(--color-ink-2);
  font-weight: var(--weight-medium);
}

.thread-spark {
  width: 100%;
  height: 28px;
  display: block;
  margin-top: auto;
  padding-top: 6px;
}
</style>
