<script setup lang="ts">
import { computed } from 'vue'
import SourceBadge from '../common/SourceBadge.vue'
import type { ExplorerArticle } from '../../api/explorer'
import { useFeedbackStore } from '../../stores/useFeedbackStore'

const props = defineProps<{ article: ExplorerArticle }>()

// Feedback = réglage calme (docs/feedback_design.md) : favori + opinion (tri-état),
// implicites source/related. Optimiste, idempotent.
const feedback = useFeedbackStore()
const fb = computed(() => feedback.get(props.article.id))
</script>

<template>
  <article class="article">
    <div class="article-body">
      <div class="a-head">
        <SourceBadge :source="article.source" />
        <span class="dot-sep" />
        <span>{{ article.date }}</span>
        <span class="dot-sep" />
        <span>{{ article.type }}</span>
      </div>

      <h3 class="article-title">{{ article.title }}</h3>
      <p class="article-summary">{{ article.summary }}</p>

      <div class="article-foot">
        <span class="axis-badge" :class="article.axisClass">{{ article.axis }}</span>

        <div class="score" tabindex="0">
          <span class="score-label">Pertinence</span>
          <div class="score-bar">
            <i :style="{ width: article.score * 100 + '%' }" />
          </div>
          <span class="score-val">{{ article.score.toFixed(2) }}</span>
          <div class="score-why" role="tooltip">
            <div class="sw-h">Pourquoi pour vous</div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p v-html="article.why || 'Sélectionné selon vos axes de veille actifs.'" />
          </div>
        </div>

        <div class="actions">
          <button
            class="act"
            :class="{ on: fb.favorite }"
            :aria-pressed="fb.favorite"
            title="Favori"
            @click="feedback.toggleFavorite(article.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M12 17.3l-5.3 3.1 1.4-6L3.5 9.8l6.1-.6L12 3.6l2.4 5.6 6.1.6-4.6 4.6 1.4 6z" />
            </svg>
          </button>
          <button
            class="act"
            :class="{ on: fb.opinion === 'relevant' }"
            :aria-pressed="fb.opinion === 'relevant'"
            title="Pertinent"
            @click="feedback.setOpinion(article.id, 'relevant')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </button>
          <!-- Signal négatif discret : révélé au survol de la carte (option A). -->
          <button
            class="act act--neg"
            :class="{ on: fb.opinion === 'not_relevant' }"
            :aria-pressed="fb.opinion === 'not_relevant'"
            title="Moins comme ça"
            @click="feedback.setOpinion(article.id, 'not_relevant')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            class="act"
            title="Ouvrir la source"
            @click="feedback.markImplicit(article.id, 'source_clicked')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M14 5h5v5M19 5l-9 9M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
            </svg>
          </button>
        </div>
      </div>

      <div class="card-links">
        <a class="card-link" href="#" title="Ouvrir la source originale" @click="feedback.markImplicit(article.id, 'source_clicked')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M14 5h5v5M19 5l-9 9M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
          </svg>
          Source originale
        </a>
        <span class="card-link-sep" />
        <a class="card-link" href="#" title="Articles liés" @click="feedback.markImplicit(article.id, 'related_clicked')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M10 14a4 4 0 0 1 0-5.7l2.8-2.8a4 4 0 1 1 5.7 5.7l-1.4 1.4M14 10a4 4 0 0 1 0 5.7l-2.8 2.8a4 4 0 1 1-5.7-5.7l1.4-1.4" />
          </svg>
          <b>{{ article.relatedCount }}</b> articles liés
        </a>
      </div>
    </div>

    <div class="article-img">
      <img :src="article.img" loading="lazy" alt="" />
    </div>
  </article>
</template>

<style scoped>
.article {
  display: grid;
  grid-template-columns: 1fr 188px;
  gap: 32px;
  padding: 28px 0;
  border-bottom: var(--border-rule);
  cursor: pointer;
  transition: opacity var(--motion-quick) var(--ease-out);
}

.article:first-child { padding-top: 6px; }

.article:hover { opacity: 0.85; }

.article:hover .article-title { color: var(--color-indigo); }

.a-head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--color-ink-3);
  letter-spacing: 0.02em;
  margin-bottom: 10px;
}

.dot-sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-ink-4);
  flex: none;
}

.article-title {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.01em;
  line-height: 1.22;
  margin-bottom: 8px;
  transition: color var(--motion-quick) var(--ease-out);
  text-wrap: pretty;
  color: var(--color-ink);
}

.article-summary {
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-ink-2);
  max-width: 62ch;
  margin-bottom: 14px;
  text-wrap: pretty;
  font-family: var(--font-sans);
}

.article-foot {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.axis-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-2);
  color: var(--color-ink-2);
  text-transform: uppercase;
  font-weight: var(--weight-medium);
  border: 1px solid var(--color-rule-2);
}

.axis-badge.indigo { background: var(--color-indigo-tint); color: var(--color-indigo); border-color: transparent; }
.axis-badge.amber  { background: var(--color-amber-tint); color: oklch(45% 0.09 65); border-color: transparent; }
.axis-badge.moss   { background: var(--color-moss-tint); color: oklch(35% 0.07 155); border-color: transparent; }
.axis-badge.rose   { background: var(--color-rose-tint); color: oklch(40% 0.10 25); border-color: transparent; }

.score {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  position: relative;
  cursor: help;
}

.score-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.score-bar {
  width: 64px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-rule);
  position: relative;
  overflow: hidden;
}

.score-bar i {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--color-moss), var(--color-amber));
  border-radius: 2px;
}

.score-val {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-ink-2);
  font-variant-numeric: tabular-nums;
}

.score-why {
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  width: 300px;
  background: var(--color-ink);
  color: oklch(98% 0.008 85);
  padding: 12px 14px;
  border-radius: 5px;
  box-shadow: 0 12px 32px oklch(0% 0 0 / 0.25), 0 2px 6px oklch(0% 0 0 / 0.12);
  opacity: 0;
  visibility: hidden;
  transform: translateY(4px);
  transition: opacity 0.15s, transform 0.15s, visibility 0.15s;
  pointer-events: none;
  z-index: 50;
}

.score-why::after {
  content: "";
  position: absolute;
  top: 100%;
  right: 22px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-top-color: var(--color-ink);
}

.sw-h {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-amber);
  margin-bottom: 6px;
  font-weight: var(--weight-medium);
  display: flex;
  align-items: center;
  gap: 6px;
}

.sw-h::before {
  content: "";
  width: 14px;
  height: 1px;
  background: var(--color-amber);
}

.score-why p {
  font-family: var(--font-serif);
  font-size: 13px;
  font-style: italic;
  line-height: 1.45;
  color: oklch(96% 0.008 85);
  text-wrap: pretty;
  margin: 0;
}

.score-why :deep(b) {
  font-style: normal;
  font-weight: var(--weight-medium);
  color: #fff;
}

.score:hover .score-why,
.score:focus-within .score-why {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition-delay: 0.15s;
}

.actions {
  display: flex;
  gap: 6px;
  margin-left: 8px;
}

.act {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  color: var(--color-ink-3);
  transition: background var(--motion-quick) var(--ease-out),
              color var(--motion-quick) var(--ease-out);
  background: none;
  border: none;
  cursor: pointer;
}

.act:hover { background: var(--color-bg-2); color: var(--color-ink); }
.act.on    { color: var(--color-amber); }

/* Signal négatif discret : invisible au repos, révélé au survol de la carte (option A). */
.act--neg {
  opacity: 0;
  width: 0;
  margin-left: -6px;
  pointer-events: none;
  transition: opacity var(--motion-quick) var(--ease-out),
              width var(--motion-quick) var(--ease-out);
}
.article:hover .act--neg,
.act--neg.on,
.act--neg:focus-visible {
  opacity: 1;
  width: 28px;
  margin-left: 0;
  pointer-events: auto;
}
.act--neg.on { color: var(--color-rose); }

.act svg { width: 14px; height: 14px; }

.card-links {
  display: flex;
  align-items: center;
  gap: 0;
  margin-top: 10px;
  margin-left: -10px;
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-ink-3);
  letter-spacing: 0.04em;
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: color var(--motion-quick) var(--ease-out),
              background var(--motion-quick) var(--ease-out);
}

.card-link:hover { color: var(--color-ink); background: var(--color-bg-2); }

.card-link svg { width: 12px; height: 12px; flex: none; }

.card-link-sep {
  width: 1px;
  height: 14px;
  background: var(--color-rule);
  margin: 0 2px;
  flex: none;
}

.article-img {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: var(--color-bg-2);
}

.article-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.article-img::after {
  content: "";
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 0 1px oklch(0% 0 0 / 0.06);
  border-radius: var(--radius-md);
  pointer-events: none;
}
</style>
