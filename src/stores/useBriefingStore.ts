import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchBriefingTodayRaw,
  fetchBriefingArticle,
  fetchPrevBriefings,
} from '../api/briefing'
import { fetchUserContext } from '../api/settings'
import type { BriefingData } from '../api/briefing'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const MAX_ALSO = 8

function deriveGreeting(ctx: Record<string, unknown> | null): string {
  const profil = (ctx?.profil ?? {}) as Record<string, unknown>
  const name = profil.prenom ?? profil.name ?? ''
  return typeof name === 'string' ? name : ''
}

export const useBriefingStore = defineStore('briefing', () => {
  const data = ref<BriefingData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    if (data.value) return
    loading.value = true
    error.value = null
    try {
      if (USE_MOCK) {
        const { MOCK_BRIEFING } = await import('../mocks/briefing')
        data.value = MOCK_BRIEFING
      } else {
        data.value = await composeReal()
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur réseau'
      // En mode réel : pas de repli mock (jamais moqué en prod). On laisse data null.
      if (USE_MOCK) {
        const { MOCK_BRIEFING } = await import('../mocks/briefing')
        data.value = MOCK_BRIEFING
      }
    } finally {
      loading.value = false
    }
  }

  // Compose le briefing à partir des sources RÉELLES disponibles. Les parts sans
  // source structurée (dossier, brèves, métadonnées d'en-tête) sont laissées
  // neutres/omises — la vue les masque (threads et faibles ont leurs propres stores).
  async function composeReal(): Promise<BriefingData> {
    const today = await fetchBriefingTodayRaw()
    const [alsoArticles, prevBriefings, ctx] = await Promise.all([
      Promise.all(today.article_ids.slice(0, MAX_ALSO).map(fetchBriefingArticle)),
      fetchPrevBriefings().catch(() => []),
      fetchUserContext().catch(() => null),
    ])
    return {
      edition: 0, // non suivi backend → masqué
      date: today.date_label,
      time: '',
      greetingName: deriveGreeting(ctx),
      sourcesScanned: 0, // métadonnées d'en-tête non exposées → ligne d'état masquée
      signalCount: 0,
      readMinutes: 0,
      activeThread: { topic: '', days: 0, shift: '' }, // panneau « fil » masqué si vide
      audioTitle: '',
      audioDuration: '',
      audioSize: '',
      threads: [], // alimenté par useThreadsStore
      dossier: null, // attend l'endpoint éditorial S1 → carte omise
      alsoArticles,
      breves: [], // pas de source → section omise
      faibles: [], // alimenté par useSerendipityStore
      prevBriefings,
    }
  }

  return { data, loading, error, load }
})
