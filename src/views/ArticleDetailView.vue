<script setup lang="ts">
// Vue détail d'article (PRD docs/PRD_article_detail_navigation.md) — charte éditoriale.
// Atteinte depuis le briefing et l'Explorer ; les articles liés se chaînent.
import { onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '../stores/useArticleStore'
import { useFeedbackStore } from '../stores/useFeedbackStore'
import SourceBadge from '../components/common/SourceBadge.vue'
import type { ArticleDetail } from '../api/articles'

const route = useRoute()
const router = useRouter()
const store = useArticleStore()
const feedback = useFeedbackStore()

const id = computed(() => decodeURIComponent(String(route.params.id ?? '')))
const article = computed(() => store.current)

onMounted(() => load())
watch(id, () => load())

async function load() {
  await store.loadOne(id.value)
  if (route.query.related) {
    await nextTick()
    const el = document.getElementById('related-section')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const paragraphs = computed(() => {
  const s = article.value?.summary
  if (!s) return []
  const sentences = s.split(/(?<=[.!?])\s+/)
  const out: string[] = []
  for (let i = 0; i < sentences.length; i += 3) out.push(sentences.slice(i, i + 3).join(' '))
  return out
})

const relatedTitle = computed(() =>
  store.subjectLabel
    ? `Articles liés — sujet « ${store.subjectLabel} »`
    : 'Articles liés — même sujet',
)

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso?.slice(0, 10) ?? ''
  }
}

function scoreLabel(s: number) {
  if (s >= 0.8) return 'Essentiel'
  if (s >= 0.65) return 'Très pertinent'
  if (s >= 0.5) return 'Pertinent'
  return 'Signal faible'
}

// URL de l'article original : link nettoyé, sinon dérivé de l'id (arXiv / http).
function originalUrl(a: ArticleDetail): string {
  if (a.link) return a.link
  const arxiv = a.id.match(/^oai:arXiv\.org:([\d.]+)/)
  if (arxiv) return `https://arxiv.org/abs/${arxiv[1]}`
  if (/^https?:\/\//.test(a.id)) { try { return decodeURIComponent(a.id) } catch { return a.id } }
  return ''
}

function openRelated(relatedId: string) {
  if (article.value) feedback.markImplicit(article.value.id, 'related_clicked')
  router.push(`/explorer/articles/${encodeURIComponent(relatedId)}`)
}

function back() {
  if (window.history.length > 1) router.back()
  else router.push('/explorer/articles')
}
</script>

<template>
  <div class="adv">
    <div v-if="store.loading && !article" class="adv-state">Chargement…</div>

    <div v-else-if="!article" class="adv-state">
      <h1 class="adv-empty-title">Article introuvable</h1>
      <p>Cet article n’est plus disponible.</p>
      <button class="adv-link" @click="router.push('/explorer/articles')">← Retour aux articles</button>
    </div>

    <article v-else class="adv-detail">
      <button class="adv-back" @click="back">← retour</button>

      <div class="adv-meta">
        <SourceBadge :source="article.source" />
        <span class="adv-dot" />
        <span>{{ formatDate(article.published) }}</span>
        <span class="adv-dot" />
        <span>{{ article.type }}</span>
      </div>

      <h1 class="adv-title">{{ article.title }}</h1>

      <div class="adv-metrics">
        <div class="adv-metric">
          <span class="adv-metric__label">Pertinence</span>
          <div class="adv-metric__val">
            <div class="adv-bar"><i :style="{ width: article.score * 100 + '%' }" /></div>
            <span>{{ scoreLabel(article.score) }}</span>
          </div>
        </div>
        <div class="adv-metric">
          <span class="adv-metric__label">Contexte</span>
          <span class="adv-metric__val">{{ article.context }}</span>
        </div>
        <div class="adv-metric">
          <span class="adv-metric__label">Tendance</span>
          <span class="adv-metric__val">{{ article.trending ? 'En hausse' : 'Stable' }}</span>
        </div>
      </div>

      <div v-if="article.labels.length" class="adv-labels">
        <span v-for="l in article.labels" :key="l" class="adv-label">{{ l }}</span>
      </div>

      <div class="adv-body">
        <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
      </div>

      <aside v-if="store.justification" class="adv-why">
        <div class="adv-why__h">Pourquoi pour vous</div>
        <p>{{ store.justification }}</p>
      </aside>

      <div class="adv-actions">
        <a
          v-if="originalUrl(article)"
          class="adv-cta"
          :href="originalUrl(article)"
          target="_blank"
          rel="noopener"
          @click="feedback.markImplicit(article.id, 'source_clicked')"
        >Lire l’article original ↗</a>
      </div>

      <section id="related-section" class="adv-related">
        <div class="adv-related__h">{{ relatedTitle }}</div>
        <p v-if="!store.related.length" class="adv-related__empty">Aucun article lié trouvé.</p>
        <ul v-else class="adv-related__list">
          <li
            v-for="r in store.related"
            :key="r.id"
            class="adv-related__item"
            role="button"
            tabindex="0"
            @click="openRelated(r.id)"
            @keydown.enter="openRelated(r.id)"
          >
            <div class="adv-related__body">
              <div class="adv-related__title">{{ r.title }}</div>
              <div class="adv-related__meta">{{ r.source }}</div>
            </div>
            <div class="adv-related__bar"><i :style="{ width: r.score * 100 + '%' }" /></div>
          </li>
        </ul>
      </section>
    </article>
  </div>
</template>

<style scoped>
.adv { max-width: 46rem; margin: 0 auto; padding: 2.5rem 2rem 4rem; position: relative; z-index: 1; }
.adv-state { padding: 3rem 0; color: var(--color-ink-3); font-family: var(--font-sans); }
.adv-empty-title { font-family: var(--font-serif); font-size: 1.5rem; color: var(--color-ink); margin-bottom: 0.5rem; }
.adv-link, .adv-back {
  background: none; border: none; cursor: pointer;
  font-family: var(--font-mono); font-size: 0.6875rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--color-ink-3); padding: 0;
}
.adv-back { margin-bottom: 1.75rem; }
.adv-back:hover, .adv-link:hover { color: var(--color-indigo); }

.adv-meta {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-mono); font-size: 11px; color: var(--color-ink-3);
  margin-bottom: 0.9rem;
}
.adv-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--color-ink-4); }

.adv-title {
  font-family: var(--font-serif); font-size: 2.1rem; font-weight: 500;
  letter-spacing: -0.015em; line-height: 1.15; color: var(--color-ink);
  margin-bottom: 1.5rem; text-wrap: pretty;
}

.adv-metrics {
  display: flex; flex-wrap: wrap; gap: 2rem;
  padding: 1rem 0; border-top: 1px solid var(--color-rule-2);
  border-bottom: 1px solid var(--color-rule-2); margin-bottom: 1.5rem;
}
.adv-metric { display: flex; flex-direction: column; gap: 0.4rem; }
.adv-metric__label {
  font-family: var(--font-mono); font-size: 0.625rem; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--color-ink-4);
}
.adv-metric__val {
  display: flex; align-items: center; gap: 0.5rem;
  font-family: var(--font-sans); font-size: 0.875rem; color: var(--color-ink-2);
}
.adv-bar { width: 64px; height: 3px; background: var(--color-rule); border-radius: 2px; overflow: hidden; }
.adv-bar i { display: block; height: 100%; background: var(--color-indigo); }

.adv-labels { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.75rem; }
.adv-label {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.04em;
  padding: 3px 8px; border-radius: 4px; background: var(--color-bg-2); color: var(--color-ink-3);
}

.adv-body { font-family: var(--font-serif); font-size: 1.125rem; line-height: 1.65; color: var(--color-ink); }
.adv-body p { margin-bottom: 1.1rem; text-wrap: pretty; }

.adv-why {
  margin: 1.75rem 0; padding: 1.1rem 1.25rem;
  background: var(--color-indigo-tint); border-radius: 12px;
}
.adv-why__h {
  font-family: var(--font-mono); font-size: 0.625rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color-indigo); margin-bottom: 0.5rem;
}
.adv-why p { font-family: var(--font-serif); font-style: italic; color: var(--color-ink-2); line-height: 1.5; }

.adv-actions { margin: 1.75rem 0; }
.adv-cta {
  display: inline-block; font-family: var(--font-sans); font-size: 0.875rem; font-weight: 500;
  padding: 0.7rem 1.25rem; border-radius: 12px;
  background: var(--color-ink); color: var(--color-paper); text-decoration: none;
}
.adv-cta:hover { background: var(--color-indigo); }

.adv-related { margin-top: 2.5rem; }
.adv-related__h {
  font-family: var(--font-mono); font-size: 0.625rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color-ink-3);
  padding-bottom: 0.6rem; border-bottom: 1px solid var(--color-rule); margin-bottom: 1rem;
}
.adv-related__empty { font-family: var(--font-sans); color: var(--color-ink-3); font-size: 0.875rem; }
.adv-related__list { list-style: none; padding: 0; display: flex; flex-direction: column; }
.adv-related__item {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: 0.85rem 0; border-bottom: 1px solid var(--color-rule-2); cursor: pointer;
}
.adv-related__item:hover .adv-related__title { color: var(--color-indigo); }
.adv-related__title {
  font-family: var(--font-serif); font-size: 1rem; color: var(--color-ink);
  line-height: 1.3; transition: color 0.15s; text-wrap: pretty;
}
.adv-related__meta { font-family: var(--font-mono); font-size: 10px; color: var(--color-ink-4); margin-top: 0.2rem; }
.adv-related__bar { width: 48px; height: 3px; background: var(--color-rule); border-radius: 2px; overflow: hidden; flex: none; }
.adv-related__bar i { display: block; height: 100%; background: var(--color-indigo); }
</style>
