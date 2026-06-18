import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchArticle,
  fetchArticleClusters,
  fetchScoreDetail,
  type ArticleDetail,
  type ClusterMembership,
} from '../api/articles'
import type { ExplorerArticle } from '../api/explorer'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const MAX_RELATED = 6

function pickLabel(ms: ClusterMembership[]): string | null {
  const labelled = ms.filter((m) => m.label).sort((a, b) => b.max_similarity - a.max_similarity)
  return labelled.length ? labelled[0].label : null
}

// Mock : promeut un ExplorerArticle (mocks) en détail pour itérer la vue en dev.
function toMockDetail(a: ExplorerArticle): ArticleDetail {
  return { ...a, context: 'central', trending: false, labels: [a.axis], relatedIds: [], published: a.date }
}

export const useArticleStore = defineStore('article', () => {
  const cache = ref<Record<string, ArticleDetail>>({})
  const current = ref<ArticleDetail | null>(null)
  const related = ref<ArticleDetail[]>([])
  const subjectLabel = ref<string | null>(null)
  const justification = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function reset() {
    current.value = null
    related.value = []
    subjectLabel.value = null
    justification.value = null
    error.value = null
  }

  async function loadOne(id: string) {
    loading.value = true
    reset()
    try {
      if (USE_MOCK) {
        const { MOCK_ARTICLES } = await import('../mocks/explorer')
        const found = MOCK_ARTICLES.find((a) => a.id === id) ?? MOCK_ARTICLES[0]
        current.value = toMockDetail(found)
        related.value = MOCK_ARTICLES.filter((a) => a.id !== found.id).slice(0, 3).map(toMockDetail)
        subjectLabel.value = found.axis
        return
      }
      const art = cache.value[id] ?? (await fetchArticle(id))
      cache.value[id] = art
      current.value = art
      // Hydratations secondaires — non bloquantes, dégradent en silence.
      void loadRelated(art.relatedIds)
      fetchArticleClusters(id).then((ms) => { subjectLabel.value = pickLabel(ms) }).catch(() => {})
      fetchScoreDetail(id)
        .then((r) => { justification.value = r.score_detail?.reranker_justification ?? null })
        .catch(() => {})
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur réseau'
    } finally {
      loading.value = false
    }
  }

  async function loadRelated(ids: string[]) {
    const slice = ids.slice(0, MAX_RELATED)
    const results = await Promise.all(
      slice.map((rid) =>
        cache.value[rid]
          ? Promise.resolve(cache.value[rid])
          : fetchArticle(rid).then((a) => { cache.value[rid] = a; return a }).catch(() => null),
      ),
    )
    related.value = results.filter((a): a is ArticleDetail => !!a)
  }

  return { current, related, subjectLabel, justification, loading, error, loadOne }
})
