<script setup lang="ts">
import type { Topic } from '../../api/explorer'

defineProps<{ topic: Topic }>()

function sparkPath(points: number[]): string {
  if (!points.length) return ''
  const W = 64, H = 18
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  return points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * W
      const y = H - ((v - min) / range) * H
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}
</script>

<template>
  <article class="topic-card" :class="{ emergent: topic.emergent }">
    <div v-if="topic.emergent" class="topic-emergent">
      Émergent
    </div>

    <h3 class="topic-name">{{ topic.name }}</h3>
    <p class="topic-desc">{{ topic.desc }}</p>

    <div class="topic-stats">
      <span><b>{{ topic.articleCount }}</b> articles</span>
      <div class="topic-trend">
        <svg class="spark" viewBox="0 0 64 18" fill="none" preserveAspectRatio="none">
          <path :d="sparkPath(topic.trend)" stroke="currentColor" stroke-width="1.4" fill="none" />
        </svg>
      </div>
    </div>

    <div class="topic-meta">
      <span class="topic-axis" :class="topic.axisClass">{{ topic.axis }}</span>
      <div class="maturity">
        <i v-for="n in 5" :key="n" :class="{ on: n <= topic.maturity }" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.topic-card {
  padding: 22px;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--motion-quick) var(--ease-out),
              transform var(--motion-quick) var(--ease-out),
              box-shadow var(--motion-quick) var(--ease-out);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.topic-card:hover {
  border-color: var(--color-ink-3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px oklch(0% 0 0 / 0.06);
}

.topic-card.emergent::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-amber);
}

.topic-emergent {
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--color-amber);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.topic-emergent::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-amber);
  flex: none;
}

.topic-name {
  font-family: var(--font-serif);
  font-size: 19px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin-bottom: 8px;
  text-wrap: pretty;
  color: var(--color-ink);
}

.topic-desc {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-ink-3);
  margin-bottom: 16px;
  text-wrap: pretty;
  min-height: 38px;
  font-family: var(--font-sans);
}

.topic-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--color-ink-3);
  margin-bottom: 10px;
}

.topic-stats b {
  color: var(--color-ink);
  font-weight: var(--weight-medium);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.topic-trend {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spark {
  width: 64px;
  height: 18px;
  color: var(--color-indigo);
}

.topic-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.05em;
  margin-top: auto;
}

.topic-axis {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  font-size: 9px;
  letter-spacing: 0.08em;
}

.topic-axis.indigo { background: var(--color-indigo-tint); color: var(--color-indigo); }
.topic-axis.amber  { background: var(--color-amber-tint); color: oklch(45% 0.09 65); }
.topic-axis.moss   { background: var(--color-moss-tint); color: oklch(35% 0.07 155); }
.topic-axis.rose   { background: var(--color-rose-tint); color: oklch(40% 0.10 25); }

.maturity {
  display: flex;
  gap: 2px;
  margin-left: auto;
}

.maturity i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-rule);
}

.maturity i.on { background: var(--color-indigo); }
</style>
