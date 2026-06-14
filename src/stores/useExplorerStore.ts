import { ref, computed } from 'vue'
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

  const AXIS_OPTIONS = ['Tous', 'Signaux faibles', 'Pro · Data', 'Pro · Dev', 'Pro · Boulot']
  const SORT_OPTIONS = ['Score', 'Date']

  const filteredArticles = computed(() => {
    let list = articles.value
    if (axisFilter.value !== 'Tous') {
      list = list.filter(a => a.axis === axisFilter.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q),
      )
    }
    if (sortOrder.value === 'Date') {
      return [...list]
    }
    return [...list].sort((a, b) => b.score - a.score)
  })

  const featuredTopics = computed(() => topics.value.filter(t => t.trend.length > 0 && t.trend.length >= 4).slice(0, 6))
  const allTopics = computed(() => topics.value)

  async function loadArticles() {
    if (articles.value.length) return
    articlesLoading.value = true
    try {
      if (USE_MOCK) {
        const { MOCK_ARTICLES } = await import('../mocks/explorer')
        articles.value = MOCK_ARTICLES
      } else {
        const data = await fetchArticles()
        articles.value = data.articles
      }
    } catch {
      const { MOCK_ARTICLES } = await import('../mocks/explorer')
      articles.value = MOCK_ARTICLES
    } finally {
      articlesLoading.value = false
    }
  }

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
    filteredArticles,
    featuredTopics,
    allTopics,
    loadArticles,
    loadTopics,
    loadCarto,
  }
})
