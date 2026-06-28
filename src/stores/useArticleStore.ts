import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchArticle,
  fetchArticleClusters,
  fetchScoreDetail,
  fetchArticleEntities,
  type ArticleDetail,
  type ArticleEntity,
  type ClusterMembership,
} from '../api/articles'
import type { ExplorerArticle } from '../api/explorer'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const MAX_RELATED = 6
const MAX_CONTRA = 4

function pickLabel(ms: ClusterMembership[]): string | null {
  const labelled = ms.filter((m) => m.label).sort((a, b) => b.max_similarity - a.max_similarity)
  return labelled.length ? labelled[0].label : null
}

// Mock : promeut un ExplorerArticle (mocks) en détail pour itérer la vue en dev.
function toMockDetail(a: ExplorerArticle): ArticleDetail {
  return {
    ...a,
    context: 'analysis',
    contextLabel: 'Analyse',
    trending: false,
    labels: [a.axis],
    relatedIds: [],
    published: a.date,
    thesisFr: null,
    isArgumentative: false,
    contradictionIds: [],
    contradictionScores: [],
    fullText: null,
  }
}

export const useArticleStore = defineStore('article', () => {
  const cache = ref<Record<string, ArticleDetail>>({})
  const current = ref<ArticleDetail | null>(null)
  const related = ref<ArticleDetail[]>([])
  const contradictions = ref<ArticleDetail[]>([])
  const entities = ref<ArticleEntity[]>([])
  const subjectLabel = ref<string | null>(null)
  const justification = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function reset() {
    current.value = null
    related.value = []
    contradictions.value = []
    entities.value = []
    subjectLabel.value = null
    justification.value = null
    error.value = null
  }

  async function loadOne(id: string) {
    loading.value = true
    reset()
    try {
      if (USE_MOCK) {
        const { MOCK_ARTICLE_DETAILS, MOCK_ARTICLE_ENTITIES } = await import('../mocks/article')
        const found = MOCK_ARTICLE_DETAILS[id] ?? Object.values(MOCK_ARTICLE_DETAILS)[0]
        current.value = found
        related.value = found.relatedIds
          .map((rid) => MOCK_ARTICLE_DETAILS[rid])
          .filter((a): a is ArticleDetail => !!a)
        contradictions.value = found.contradictionIds
          .map((cid) => MOCK_ARTICLE_DETAILS[cid])
          .filter((a): a is ArticleDetail => !!a)
        entities.value = MOCK_ARTICLE_ENTITIES[found.id] ?? []
        subjectLabel.value = found.axis
        justification.value = found.why || null
        return
      }
      const art = cache.value[id] ?? (await fetchArticle(id))
      cache.value[id] = art
      current.value = art
      // Hydratations secondaires — non bloquantes, dégradent en silence.
      void loadRelated(art.relatedIds)
      void loadContradictions(art.contradictionIds)
      fetchArticleClusters(id).then((ms) => { subjectLabel.value = pickLabel(ms) }).catch(() => {})
      fetchScoreDetail(id)
        .then((r) => { justification.value = r.score_detail?.reranker_justification ?? null })
        .catch(() => {})
      fetchArticleEntities(id).then((es) => { entities.value = es }).catch(() => {})
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur réseau'
    } finally {
      loading.value = false
    }
  }

  async function loadList(ids: string[], max: number): Promise<ArticleDetail[]> {
    const slice = ids.slice(0, max)
    const results = await Promise.all(
      slice.map((rid) =>
        cache.value[rid]
          ? Promise.resolve(cache.value[rid])
          : fetchArticle(rid).then((a) => { cache.value[rid] = a; return a }).catch(() => null),
      ),
    )
    return results.filter((a): a is ArticleDetail => !!a)
  }

  async function loadRelated(ids: string[]) {
    related.value = await loadList(ids, MAX_RELATED)
  }

  async function loadContradictions(ids: string[]) {
    contradictions.value = await loadList(ids, MAX_CONTRA)
  }

  return {
    current, related, contradictions, entities,
    subjectLabel, justification, loading, error, loadOne,
  }
})
