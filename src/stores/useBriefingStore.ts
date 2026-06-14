import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchBriefingToday } from '../api/briefing'
import type { BriefingData } from '../api/briefing'

export const useBriefingStore = defineStore('briefing', () => {
  const data = ref<BriefingData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    if (data.value) return
    loading.value = true
    error.value = null
    try {
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        const { MOCK_BRIEFING } = await import('../mocks/briefing')
        data.value = MOCK_BRIEFING
      } else {
        data.value = await fetchBriefingToday()
      }
    } catch (e) {
      const { MOCK_BRIEFING } = await import('../mocks/briefing')
      data.value = MOCK_BRIEFING
      error.value = e instanceof Error ? e.message : 'Erreur réseau'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, load }
})
