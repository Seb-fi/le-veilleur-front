import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchCarved, type CarvedFil } from '../api/threads'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Item rendu par ThreadsStrip — fil CARVÉ gaté (Phase 2 : source basculée des fils bruts).
export interface StripThread {
  dossierId: string
  name: string
  anchor: string
  sourceCount: number
  cohesion: number | null
  fil: CarvedFil
}

function adapt(f: CarvedFil): StripThread {
  return {
    dossierId: f.dossier_id,
    name: f.name || f.anchor,
    anchor: f.anchor,
    sourceCount: f.source_count ?? f.sources.length,
    cohesion: f.cohesion,
    fil: f,
  }
}

export const useThreadsStore = defineStore('threads', () => {
  const threads = ref<StripThread[]>([])
  const note = ref<string | null>(null)
  const loaded = ref(false)
  const detail = ref<CarvedFil | null>(null)

  async function load() {
    if (loaded.value) return
    if (USE_MOCK) {
      // Mode design (dev sans backend) : fils du mock briefing adaptés au modèle carvé.
      const { MOCK_BRIEFING } = await import('../mocks/briefing')
      threads.value = MOCK_BRIEFING.threads.map((t, i) => ({
        dossierId: `mock-${i}`,
        name: t.name,
        anchor: t.name,
        sourceCount: t.articleCount,
        cohesion: 0.6,
        fil: {
          dossier_id: `mock-${i}`, anchor: t.name, column_label: t.name, name: t.name,
          source_count: t.articleCount, burst: null, cohesion: 0.6, cohesion_penalty: 1,
          gated_score: null, is_emerging: true,
          sources: MOCK_BRIEFING.alsoArticles.slice(0, 3).map((a) => ({
            article_id: a.id, title: a.title, link: null, source: a.source, published: a.date,
          })),
        },
      }))
      loaded.value = true
      return
    }
    try {
      const env = await fetchCarved(4)
      // Dégénéré → bande absente. Cold-start = aperçu global réel (note explicative), on l'affiche.
      threads.value = env.degenerate ? [] : env.fils.map(adapt)
      note.value = env.note
    } catch {
      threads.value = [] // échec réseau → on omet (pas de fil fabriqué)
    } finally {
      loaded.value = true
    }
  }

  // Détail = le fil carvé lui-même (sources servies en ligne par /threads/carved — aucun réseau).
  function openDetail(dossierId: string) {
    detail.value = threads.value.find((t) => t.dossierId === dossierId)?.fil ?? null
  }

  function closeDetail() {
    detail.value = null
  }

  return { threads, note, detail, load, openDetail, closeDetail }
})
