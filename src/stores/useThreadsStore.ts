import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchThreads,
  fetchThreadDetail,
  type ThreadOut,
  type ThreadDetail,
} from '../api/threads'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Item rendu par ThreadsStrip — front Thread + thread_id pour le clic → sources.
export interface StripThread {
  threadId: string
  name: string
  status: string
  statusLabel: string
  daysTracked: number
  articleCount: number
  sparkPoints: number[]
}

function adapt(t: ThreadOut): StripThread {
  return {
    threadId: t.thread_id,
    name: t.name,
    // Backend n'émet que rising/steady (déjà des classes front valides).
    status: t.status,
    statusLabel: t.status_label,
    daysTracked: t.days_tracked,
    articleCount: t.article_count,
    sparkPoints: t.spark_points,
  }
}

export const useThreadsStore = defineStore('threads', () => {
  const threads = ref<StripThread[]>([])
  const note = ref<string | null>(null)
  const loaded = ref(false)
  const detail = ref<ThreadDetail | null>(null)
  const detailLoading = ref(false)

  async function load() {
    if (loaded.value) return
    if (USE_MOCK) {
      // Mode design (dev sans backend) : fils du mock briefing, pour itérer l'UI.
      const { MOCK_BRIEFING } = await import('../mocks/briefing')
      threads.value = MOCK_BRIEFING.threads.map((t, i) => ({
        threadId: `mock-${i}`,
        name: t.name,
        status: t.status,
        statusLabel: t.statusLabel,
        daysTracked: t.daysTracked,
        articleCount: t.articleCount,
        sparkPoints: t.sparkPoints,
      }))
      loaded.value = true
      return
    }
    try {
      const env = await fetchThreads(4)
      // PRD : « sinon omis, jamais moqué ». cold_start / dégénéré / vide → bande absente.
      threads.value = env.cold_start || env.degenerate ? [] : env.threads.map(adapt)
      note.value = env.note
    } catch {
      // Échec réseau en mode réel → on omet (pas de fil fabriqué).
      threads.value = []
    } finally {
      loaded.value = true
    }
  }

  async function openDetail(threadId: string) {
    detailLoading.value = true
    detail.value = null
    if (USE_MOCK) {
      const { MOCK_BRIEFING } = await import('../mocks/briefing')
      const t = threads.value.find((x) => x.threadId === threadId)
      detail.value = {
        thread_id: threadId,
        kind: 'mock',
        anchor: t?.name ?? '',
        name: t?.name ?? '',
        status: t?.status ?? 'steady',
        status_label: t?.statusLabel ?? '',
        days_tracked: t?.daysTracked ?? 0,
        article_count: t?.articleCount ?? 0,
        source_count: 0,
        claim_count: 0,
        is_emerging: t?.status === 'rising',
        spark_kind: 'volume',
        spark_points: t?.sparkPoints ?? [],
        claims: [],
        sources: MOCK_BRIEFING.alsoArticles.slice(0, 3).map((a) => ({
          article_id: a.id,
          title: a.title,
          link: null,
          source: a.source,
          published: a.date,
        })),
      }
      detailLoading.value = false
      return
    }
    try {
      detail.value = await fetchThreadDetail(threadId)
    } finally {
      detailLoading.value = false
    }
  }

  function closeDetail() {
    detail.value = null
  }

  return { threads, note, detail, detailLoading, load, openDetail, closeDetail }
})
