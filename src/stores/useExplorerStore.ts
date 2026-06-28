import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { fetchArticles, fetchTopics, fetchCarto } from '../api/explorer'
import type { ExplorerArticle, Topic, CartoData } from '../api/explorer'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const useExplorerStore = defineStore('explorer', () => {
  const articles = ref<ExplorerArticle[]>([])
  const topics = ref<Topic[]>([])
  const carto = ref<CartoData | null>(null)

  const articlesLoading = ref(false)
  const topicsLoading = ref(false)
  const cartoLoading = ref(false)

  const axisFilter = ref('Tous')
  const sortOrder = ref('Score')
  const searchQuery = ref('')

  // Pagination serveur — le tri et la recherche sont poussés au back ; l'axe reste un
  // filtre client sur la page chargée (la taxonomie d'axes n'est pas stabilisée côté back).
  const PAGE = 60
  const offset = ref(0)
  const hasMore = ref(true)
  const loadingMore = ref(false)

  const AXIS_OPTIONS = ['Tous', 'Signaux faibles', 'Pro · Data', 'Pro · Dev', 'Pro · Boulot']
  const SORT_OPTIONS = ['Score', 'Date']
  const serverSort = () => (sortOrder.value === 'Date' ? 'date' : 'score')

  const filteredArticles = computed(() => {
    let list = articles.value
    // Filtre d'axe : toujours client (la taxonomie d'axes n'est pas portée par le back).
    if (axisFilter.value !== 'Tous') {
      list = list.filter(a => a.axis === axisFilter.value)
    }
    // En mode réel, tri + recherche sont déjà appliqués par le serveur (pagination).
    // En mock, on les rejoue côté client (pas de serveur).
    if (USE_MOCK) {
      const q = searchQuery.value.trim().toLowerCase()
      if (q) {
        list = list.filter(a =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q),
        )
      }
      list = sortOrder.value === 'Date' ? [...list] : [...list].sort((a, b) => b.score - a.score)
    }
    return list
  })

  const featuredTopics = computed(() => topics.value.filter(t => t.trend.length > 0 && t.trend.length >= 4).slice(0, 6))
  const allTopics = computed(() => topics.value)

  async function loadArticles() {
    articlesLoading.value = true
    offset.value = 0
    try {
      if (USE_MOCK) {
        const { MOCK_ARTICLES } = await import('../mocks/explorer')
        articles.value = MOCK_ARTICLES
        hasMore.value = false
      } else {
        const data = await fetchArticles({
          sort: serverSort(),
          q: searchQuery.value.trim() || undefined,
          limit: PAGE,
          offset: 0,
        })
        articles.value = data.articles
        hasMore.value = data.total >= PAGE
        offset.value = PAGE
      }
    } catch {
      const { MOCK_ARTICLES } = await import('../mocks/explorer')
      articles.value = MOCK_ARTICLES
      hasMore.value = false
    } finally {
      articlesLoading.value = false
    }
  }

  // « Charger plus » : page suivante appondue (pas de re-render du tout).
  async function loadMoreArticles() {
    if (USE_MOCK || loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const data = await fetchArticles({
        sort: serverSort(),
        q: searchQuery.value.trim() || undefined,
        limit: PAGE,
        offset: offset.value,
      })
      articles.value = [...articles.value, ...data.articles]
      hasMore.value = data.total >= PAGE
      offset.value += PAGE
    } finally {
      loadingMore.value = false
    }
  }

  // Tri/recherche → re-fetch serveur (recherche débouncée). L'axe reste client (computed).
  let searchTimer: ReturnType<typeof setTimeout> | null = null
  watch(sortOrder, () => { void loadArticles() })
  watch(searchQuery, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => { void loadArticles() }, 300)
  })

  async function loadTopics() {
    if (topics.value.length) return
    topicsLoading.value = true
    try {
      if (USE_MOCK) {
        const { MOCK_TOPICS } = await import('../mocks/explorer')
        topics.value = MOCK_TOPICS
      } else {
        topics.value = await fetchTopics()
      }
    } catch {
      const { MOCK_TOPICS } = await import('../mocks/explorer')
      topics.value = MOCK_TOPICS
    } finally {
      topicsLoading.value = false
    }
  }

  async function loadCarto() {
    if (carto.value) return
    cartoLoading.value = true
    try {
      if (USE_MOCK) {
        const { MOCK_CARTO } = await import('../mocks/explorer')
        carto.value = MOCK_CARTO
      } else {
        carto.value = await fetchCarto()
      }
    } catch {
      const { MOCK_CARTO } = await import('../mocks/explorer')
      carto.value = MOCK_CARTO
    } finally {
      cartoLoading.value = false
    }
  }

  return {
    articles,
    topics,
    carto,
    articlesLoading,
    topicsLoading,
    cartoLoading,
    axisFilter,
    sortOrder,
    searchQuery,
    AXIS_OPTIONS,
    SORT_OPTIONS,
    hasMore,
    loadingMore,
    filteredArticles,
    featuredTopics,
    allTopics,
    loadArticles,
    loadMoreArticles,
    loadTopics,
    loadCarto,
  }
})
