<script setup lang="ts">
import SourceBadge from '../common/SourceBadge.vue'
import ScoreBadge from '../common/ScoreBadge.vue'
import type { BriefingArticle } from '../../api/briefing'

defineProps<{ article: BriefingArticle }>()
</script>

<template>
  <article class="acard">
    <div class="acard-thumb">
      <img :src="article.img" loading="lazy" alt="" />
    </div>

    <div class="acard-head">
      <SourceBadge :source="article.source" />
      <span class="dot-sep" />
      <span>{{ article.date }}</span>
    </div>

    <h3 class="acard-title">{{ article.title }}</h3>
    <p class="acard-summary">{{ article.summary }}</p>

    <div class="acard-foot">
      <span class="badge" :class="article.axisClass">{{ article.axis }}</span>
      <ScoreBadge :score="article.score" :why="article.why" :compact="true" />
    </div>

    <div class="acard-links">
      <a class="card-link" href="#">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M14 5h5v5M19 5l-9 9M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5"/>
        </svg>
        Source originale
      </a>
      <span class="card-link-sep" />
      <a class="card-link" href="#">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M10 14a4 4 0 0 1 0-5.7l2.8-2.8a4 4 0 1 1 5.7 5.7l-1.4 1.4M14 10a4 4 0 0 1 0 5.7l-2.8 2.8a4 4 0 1 1-5.7-5.7l1.4-1.4"/>
        </svg>
        <b>{{ article.relatedCount ?? 4 }}</b> articles liés
      </a>
    </div>
  </article>
</template>

<style scoped>
.acard {
  padding: 20px 22px 18px;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: border-color var(--motion-quick) var(--ease-out),
              box-shadow var(--motion-quick) var(--ease-out);
}

.acard:hover {
  border-color: var(--color-ink-3);
  box-shadow: 0 2px 8px oklch(0% 0 0 / 0.04);
}

.acard:hover .acard-title { color: var(--color-indigo); }

.acard-thumb {
  margin: -20px -22px 0;
  aspect-ratio: 16 / 8;
  overflow: hidden;
  background: var(--color-bg-2);
  order: -1;
}

.acard-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(0.93);
}

.acard-head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--color-ink-3);
}

.dot-sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-ink-4);
  flex: none;
}

.acard-title {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.01em;
  line-height: 1.22;
  text-wrap: pretty;
  color: var(--color-ink);
  transition: color var(--motion-quick) var(--ease-out);
}

.acard-summary {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--color-ink-2);
  text-wrap: pretty;
}

.acard-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: var(--border-rule-2);
  margin-top: auto;
  flex-wrap: wrap;
}

.badge {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-2);
  color: var(--color-ink-2);
  text-transform: uppercase;
  font-weight: var(--weight-medium);
  border: var(--border-rule-2);
}

.badge.indigo { background: var(--color-indigo-tint); color: var(--color-indigo); border-color: transparent; }
.badge.amber  { background: var(--color-amber-tint);  color: oklch(45% 0.09 65); border-color: transparent; }
.badge.moss   { background: var(--color-moss-tint);   color: oklch(35% 0.07 155); border-color: transparent; }
.badge.rose   { background: var(--color-rose-tint);   color: oklch(40% 0.1 25); border-color: transparent; }

.acard-links {
  display: flex;
  align-items: center;
  padding-top: 8px;
  margin: 0 -10px -4px;
  flex-wrap: wrap;
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: var(--color-ink-3);
  padding: 6px 10px;
  border-radius: var(--radius-md);
  transition: background var(--motion-quick) var(--ease-out),
              color var(--motion-quick) var(--ease-out);
  text-decoration: none;
}

.card-link:hover { background: var(--color-bg-2); color: var(--color-ink); }
.card-link svg { width: 12px; height: 12px; flex: none; opacity: 0.7; }
.card-link:hover svg { opacity: 1; }
.card-link b { color: var(--color-indigo); font-weight: var(--weight-medium); font-variant-numeric: tabular-nums; }
.card-link-sep { width: 1px; height: 11px; background: var(--color-rule); margin: 0 2px; }
</style>
