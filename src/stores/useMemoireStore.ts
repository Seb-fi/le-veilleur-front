import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { fetchMemoire } from '../api/memoire'
import type { MemoireData } from '../api/memoire'
import type { Piste, PisteId, Note, NoteId, Article, ArticleId, DomainEvent } from '../types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export type StreamFilter = 'Tout' | 'Articles' | 'Notes' | 'Évènements'

export type StreamNote    = Note        & { traceKind: 'note' }
export type StreamArticle = Article     & { traceKind: 'article' }
export type StreamEvent   = DomainEvent & { traceKind: 'event' }
export type StreamItem    = StreamNote | StreamArticle | StreamEvent

export const useMemoireStore = defineStore('memoire', () => {
  const data = ref<MemoireData | null>(null)
  const loading = ref(false)

  const activePisteId = ref<PisteId | null>(null)
  const streamFilter = ref<StreamFilter>('Tout')
  const mode = ref<'tree' | 'graph'>('tree')

  const noteModalOpen = ref(false)
  const noteModalContext = ref<string>('')
  const noteModalInitial = ref<string>('')
  const noteModalNoteId = ref<NoteId | null>(null)

  const whisperDismissed = ref(false)

  const activePistes = computed(() =>
    data.value?.pistes.filter(p => p.status === 'active' || p.status === 'emerging') ?? [],
  )

  const dormantPistes = computed(() =>
    data.value?.pistes.filter(p => p.status === 'dormant') ?? [],
  )

  const activePiste = computed<Piste | null>(() => {
    if (!activePisteId.value || !data.value) return null
    return data.value.pistes.find(p => p.id === activePisteId.value) ?? null
  })

  const pinnedNote = computed<Note | null>(() => {
    if (!activePiste.value || !data.value) return null
    const noteId = activePiste.value.pinnedNoteId
    if (!noteId) return null
    return data.value.notes.find(n => n.id === noteId) ?? null
  })

  const railPinnedNote = computed<Note | null>(() => {
    if (!data.value) return null
    return data.value.notes.find(n => n.pinned) ?? null
  })

  const pisteStream = computed<StreamItem[]>(() => {
    if (!activePisteId.value || !data.value) return []
    const pid = activePisteId.value
    const notes: StreamNote[] = data.value.notes
      .filter(n => n.pisteId === pid && !n.pinned)
      .map(n => ({ ...n, traceKind: 'note' as const }))
    const articles: StreamArticle[] = data.value.articles
      .filter(a => a.pisteIds.includes(pid))
      .map(a => ({ ...a, traceKind: 'article' as const }))
    const events: StreamEvent[] = data.value.events
      .filter(e => e.pisteIds.includes(pid))
      .map(e => ({ ...e, traceKind: 'event' as const }))
    const all: StreamItem[] = [...notes, ...articles, ...events]
    all.sort((a, b) => {
      const dateA = a.traceKind === 'note' ? a.createdAt : a.traceKind === 'article' ? a.savedAt : a.occurredAt
      const dateB = b.traceKind === 'note' ? b.createdAt : b.traceKind === 'article' ? b.savedAt : b.occurredAt
      return dateB.localeCompare(dateA)
    })
    if (streamFilter.value === 'Tout') return all
    if (streamFilter.value === 'Notes') return all.filter(t => t.traceKind === 'note')
    if (streamFilter.value === 'Articles') return all.filter(t => t.traceKind === 'article')
    if (streamFilter.value === 'Évènements') return all.filter(t => t.traceKind === 'event')
    return all
  })

  async function load() {
    if (data.value) return
    loading.value = true
    try {
      if (USE_MOCK) {
        const { MOCK_MEMOIRE } = await import('../mocks/memoire')
        data.value = MOCK_MEMOIRE
      } else {
        data.value = await fetchMemoire()
      }
      if (activePistes.value.length) {
        activePisteId.value = activePistes.value[0].id
      }
    } catch {
      const { MOCK_MEMOIRE } = await import('../mocks/memoire')
      data.value = MOCK_MEMOIRE
      if (activePistes.value.length) {
        activePisteId.value = activePistes.value[0].id
      }
    } finally {
      loading.value = false
    }
  }

  function selectPiste(id: PisteId) {
    activePisteId.value = id
    streamFilter.value = 'Tout'
    whisperDismissed.value = false
  }

  function openNoteModal(context: string, initial = '', noteId: NoteId | null = null) {
    noteModalContext.value = context
    noteModalInitial.value = initial
    noteModalNoteId.value = noteId
    noteModalOpen.value = true
  }

  function closeNoteModal() {
    noteModalOpen.value = false
  }

  function saveModalNote(body: string) {
    if (!data.value || !activePisteId.value) return
    if (noteModalNoteId.value) {
      const existing = data.value.notes.find(n => n.id === noteModalNoteId.value)
      if (existing) existing.body = body
    } else {
      const newNote = {
        id: `n-${Date.now()}` as NoteId,
        body,
        createdAt: new Date().toISOString(),
        pisteId: activePisteId.value,
        pinned: false,
      }
      data.value.notes.unshift(newNote)
      data.value.stats.noteCount++
    }
    closeNoteModal()
  }

  function pinStreamNote(noteId: NoteId) {
    if (!data.value || !activePisteId.value) return
    const piste = data.value.pistes.find(p => p.id === activePisteId.value)
    if (!piste) return
    data.value.notes.forEach(n => {
      if (n.pisteId === activePisteId.value) n.pinned = false
    })
    const note = data.value.notes.find(n => n.id === noteId)
    if (note) note.pinned = true
    piste.pinnedNoteId = noteId
  }

  return {
    data, loading, mode,
    activePisteId, streamFilter,
    noteModalOpen, noteModalContext, noteModalInitial, noteModalNoteId,
    whisperDismissed,
    activePistes, dormantPistes, activePiste, pinnedNote, railPinnedNote, pisteStream,
    load, selectPiste, openNoteModal, closeNoteModal, saveModalNote, pinStreamNote,
  }
})
