<script setup lang="ts">
// Détail d'un fil (PRD threads §detail) : la trace — claims + articles sources.
// Ouvert au clic sur un fil de la bande. Lecture seule.
import type { ThreadDetail } from '../../api/threads'

defineProps<{ detail: ThreadDetail | null; loading: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="loading || detail" class="td-overlay" @click.self="emit('close')">
      <aside class="td" role="dialog" aria-label="Détail du fil">
        <button class="td-close" aria-label="Fermer" @click="emit('close')">×</button>

        <div v-if="loading" class="td-loading">Chargement du fil…</div>

        <template v-else-if="detail">
          <p class="td-eyebrow">{{ detail.status_label }}</p>
          <h2 class="td-name">{{ detail.name }}</h2>
          <p class="td-meta">
            Suivi depuis <b>{{ detail.days_tracked }} j</b> ·
            {{ detail.article_count }} articles · {{ detail.source_count }} sources
          </p>

          <template v-if="detail.claims.length">
            <p class="td-section">Ce qui se dit</p>
            <ul class="td-claims">
              <li v-for="(c, i) in detail.claims" :key="i">{{ c.claim_text }}</li>
            </ul>
          </template>

          <p class="td-section">Sources</p>
          <ul class="td-sources">
            <li v-for="s in detail.sources" :key="s.article_id" class="td-source">
              <a v-if="s.link" :href="s.link" target="_blank" rel="noopener" class="td-source__title">
                {{ s.title ?? s.article_id }}
              </a>
              <span v-else class="td-source__title">{{ s.title ?? s.article_id }}</span>
              <span class="td-source__meta">{{ s.source }}<template v-if="s.published"> · {{ s.published }}</template></span>
            </li>
            <li v-if="!detail.sources.length" class="td-source__empty">Aucune source remontée.</li>
          </ul>
        </template>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.td-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: oklch(20% 0.012 250 / 0.28);
  display: flex;
  justify-content: flex-end;
}
.td {
  position: relative;
  width: min(34rem, 92vw);
  height: 100%;
  overflow-y: auto;
  background: var(--color-paper);
  border-left: 1px solid var(--color-rule);
  padding: 3rem 2.25rem 2.5rem;
}
.td-close {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-ink-3);
  background: none;
  border: none;
  cursor: pointer;
}
.td-loading { color: var(--color-ink-3); font-family: var(--font-sans); }
.td-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-indigo);
}
.td-name {
  font-family: var(--font-serif);
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-ink);
  margin: 0.5rem 0 0.5rem;
}
.td-meta {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-ink-4);
  margin-bottom: 1.75rem;
}
.td-meta b { color: var(--color-ink-2); }
.td-section {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin: 1.5rem 0 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--color-rule-2);
}
.td-claims {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.td-claims li {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--color-ink-2);
}
.td-sources {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.td-source { display: flex; flex-direction: column; gap: 0.2rem; }
.td-source__title {
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  color: var(--color-ink);
  text-decoration: none;
}
a.td-source__title:hover { color: var(--color-indigo); text-decoration: underline; }
.td-source__meta {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  color: var(--color-ink-4);
}
.td-source__empty { font-family: var(--font-sans); color: var(--color-ink-3); }
</style>
