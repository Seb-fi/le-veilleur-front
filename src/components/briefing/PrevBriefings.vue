<script setup lang="ts">
import type { PrevBriefing } from '../../api/briefing'

defineProps<{ prevBriefings: PrevBriefing[] }>()
</script>

<template>
  <section class="prev-section">
    <div class="prev-grid">
      <article
        v-for="b in prevBriefings"
        :key="b.edition"
        class="prev-card"
      >
        <div class="prev-edition">
          <span>{{ b.date }}</span>
          <b>n°{{ b.edition }}</b>
        </div>
        <h4 class="prev-title">{{ b.title }}</h4>
        <div class="prev-meta">
          <span>{{ b.duration }}</span>
          <span class="sep" />
          <span>{{ b.articleCount }} articles</span>
          <span class="sep" />
          <span :class="b.listened ? 'meta--listened' : 'meta--unread'">
            {{ b.listened ? '✓ écouté' : 'non lu' }}
          </span>
        </div>
      </article>
    </div>
    <a class="prev-all" href="#">Voir toutes les éditions →</a>
  </section>
</template>

<style scoped>
.prev-section { margin-top: 64px; }

.prev-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.prev-card {
  padding: 18px 20px;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--motion-quick) var(--ease-out),
              transform var(--motion-quick) var(--ease-out);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prev-card:hover {
  border-color: var(--color-ink-3);
  transform: translateY(-1px);
}

.prev-card:hover .prev-title { color: var(--color-indigo); }

.prev-edition {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  font-weight: var(--weight-medium);
  display: flex;
  justify-content: space-between;
}

.prev-edition b {
  color: var(--color-ink-2);
  font-weight: var(--weight-medium);
  letter-spacing: 0;
  text-transform: none;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 12px;
}

.prev-title {
  font-family: var(--font-serif);
  font-size: 15.5px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.005em;
  line-height: 1.3;
  color: var(--color-ink);
  text-wrap: pretty;
  transition: color var(--motion-quick) var(--ease-out);
}

.prev-meta {
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--color-ink-4);
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-ink-4);
}

.meta--listened { color: var(--color-moss); }
.meta--unread   { color: var(--color-ink-3); }

.prev-all {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  color: var(--color-indigo);
  padding: 6px 0;
  border-bottom: 1px solid var(--color-indigo);
  transition: color var(--motion-quick) var(--ease-out);
  text-decoration: none;
}

.prev-all:hover { color: var(--color-ink); }
</style>
