<script setup lang="ts">
import SourceBadge from '../common/SourceBadge.vue'
import type { Dossier } from '../../api/briefing'

defineProps<{ dossier: Dossier }>()
</script>

<template>
  <article class="bcard bcard--featured">
    <div class="dossier">
      <figure class="dossier-figure">
        <img :src="dossier.img" loading="lazy" alt="" />
        <figcaption>
          <b>Dossier</b>
          {{ dossier.imgCaption }}
        </figcaption>
      </figure>

      <div class="dossier-content">
        <div class="dossier-eyebrow">{{ dossier.category }}</div>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <h1 class="dossier-headline" v-html="dossier.headline" />

        <div class="dossier-byline">
          <SourceBadge :source="dossier.sourceLabel" :veilleur="true" size="lg" />
          <span class="dossier-byline__sep" />
          <span>{{ dossier.sourceCount }} sources croisées</span>
          <span class="dossier-byline__sep" />
          <span>Lecture : {{ dossier.readTime }} min</span>
        </div>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="dossier-lede" v-html="dossier.lede" />

        <a class="dossier-cta" href="#">
          Lire le dossier complet
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </a>

        <div class="card-links">
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
            <b>{{ dossier.relatedCount }}</b> articles liés
          </a>
        </div>
      </div>

      <div class="dossier-grid">
        <div class="dossier-block">
          <h4>Synthèse</h4>
          <p>{{ dossier.synthesis }}</p>
        </div>
        <div class="dossier-block dossier-block--tension">
          <h4>Tensions</h4>
          <p>{{ dossier.tensions }}</p>
        </div>
        <div class="dossier-block dossier-block--matter">
          <h4>Ce que cela change</h4>
          <p>{{ dossier.matters }}</p>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.bcard {
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.bcard--featured {
  grid-column: span 2;
  border: 1px solid var(--color-ink);
}

.bcard--featured:hover {
  box-shadow: 0 4px 24px oklch(0% 0 0 / 0.06);
}

.dossier {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 0;
}

.dossier-figure {
  margin: 0;
  position: relative;
  overflow: hidden;
  min-height: 420px;
  background: var(--color-bg-2);
}

.dossier-figure img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(0.94);
}

.dossier-figure figcaption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 20px;
  background: linear-gradient(to top, oklch(0% 0 0 / 0.55), transparent);
  color: oklch(99% 0.005 85);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 12.5px;
  line-height: 1.45;
  max-width: 42ch;
  text-shadow: 0 1px 4px oklch(0% 0 0 / 0.35);
}

.dossier-figure figcaption :deep(b) {
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 9.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: oklch(99% 0.005 85 / 0.85);
  margin-right: 8px;
  font-weight: var(--weight-medium);
}

.dossier-content {
  padding: 32px 36px 28px;
  display: flex;
  flex-direction: column;
}

.dossier-eyebrow {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-indigo);
  margin-bottom: 14px;
  font-weight: var(--weight-medium);
  display: flex;
  align-items: center;
  gap: 10px;
}

.dossier-eyebrow::before {
  content: "";
  width: 18px;
  height: 1px;
  background: var(--color-indigo);
}

.dossier-headline {
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.02em;
  line-height: 1.08;
  margin-bottom: 16px;
  text-wrap: pretty;
  color: var(--color-ink);
}

.dossier-headline :deep(em) {
  font-style: italic;
  font-weight: var(--weight-regular);
  color: var(--color-indigo);
}

.dossier-byline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: var(--border-rule);
  border-bottom: var(--border-rule);
  margin-bottom: 18px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--color-ink-3);
  letter-spacing: 0.04em;
}

.dossier-byline__sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-ink-4);
}

.dossier-lede {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: var(--weight-regular);
  line-height: 1.5;
  color: var(--color-ink);
  margin-bottom: 20px;
  text-wrap: pretty;
}

.dossier-lede::first-letter {
  font-family: var(--font-serif);
  font-size: 54px;
  font-weight: var(--weight-medium);
  float: left;
  line-height: 0.85;
  padding: 4px 12px 0 0;
  color: var(--color-indigo);
}

.dossier-cta {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 9px 14px;
  background: var(--color-ink);
  color: var(--color-bg);
  border-radius: 5px;
  font-size: 13px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.005em;
  transition: background var(--motion-quick) var(--ease-out);
}

.dossier-cta:hover { background: var(--color-indigo); }
.dossier-cta svg { width: 13px; height: 13px; }

.card-links {
  margin-top: 14px;
  padding-top: 14px;
  border-top: var(--border-rule-2);
  margin-left: -10px;
  display: flex;
  align-items: center;
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
  transition: background var(--motion-quick) var(--ease-out), color var(--motion-quick) var(--ease-out);
  text-decoration: none;
}

.card-link:hover { background: var(--color-bg-2); color: var(--color-ink); }
.card-link svg { width: 12px; height: 12px; flex: none; opacity: 0.7; }
.card-link:hover svg { opacity: 1; }
.card-link b { color: var(--color-indigo); font-weight: var(--weight-medium); font-variant-numeric: tabular-nums; }

.card-link-sep { width: 1px; height: 11px; background: var(--color-rule); margin: 0 2px; }

/* Bottom analysis grid */
.dossier-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  padding: 24px 36px 32px;
  border-top: var(--border-rule);
  background: var(--color-bg);
}

.dossier-block h4 {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: var(--weight-medium);
}

.dossier-block h4::before {
  content: "";
  width: 18px;
  height: 1px;
  background: var(--color-indigo);
}

.dossier-block--tension h4::before { background: var(--color-amber); }
.dossier-block--matter h4::before  { background: var(--color-moss); }

.dossier-block p {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--color-ink-2);
  text-wrap: pretty;
}
</style>
