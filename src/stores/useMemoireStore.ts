import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  Favori, Piste, PisteId, PisteColor, Note, NoteId, ArticleId, Apercu,
} from '../types'
import * as memoireApi from '../api/memoire'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export type MemScreen = 'favoris' | 'pistes' | 'fiche' | 'composer' | 'notes'
export type FavFilter = { kind: 'all' } | { kind: 'unassigned' } | { kind: 'piste'; id: PisteId }
export type NotesGrouping = 'toutes' | 'piste' | 'article'

let mockSeq = 0
function nowIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export const useMemoireStore = defineStore('memoire', () => {
  // ---- Données chargées depuis l'API ----------------------------------------
  const favorites = ref<Favori[]>([])
  const pistes = ref<Piste[]>([])
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  // ---- Navigation interne ---------------------------------------------------
  const screen = ref<MemScreen>('favoris')
  const currentPisteId = ref<PisteId | null>(null)
  /** Identifiant d'une piste en cours de création (composeur sans id back). */
  const composerDraftId = ref<PisteId | null>(null)

  // ---- État UI --------------------------------------------------------------
  const favFilter = ref<FavFilter>({ kind: 'all' })
  const favSearch = ref('')
  const notesSearch = ref('')
  const notesGrouping = ref<NotesGrouping>('toutes')

  const toastMessage = ref<string | null>(null)
  let toastTimer: ReturnType<typeof setTimeout> | null = null
  function toast(message: string) {
    toastMessage.value = message
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastMessage.value = null
    }, 2200)
  }

  // ---- Dérivés (jamais stockés) ---------------------------------------------
  const favoriCounts = computed<Record<string, number>>(() => {
    const acc: Record<string, number> = {}
    for (const f of favorites.value) {
      for (const pid of f.pisteIds) acc[pid] = (acc[pid] ?? 0) + 1
    }
    return acc
  })

  const unassignedCount = computed(
    () => favorites.value.filter((f) => f.pisteIds.length === 0).length,
  )

  function favorisOf(pisteId: PisteId): Favori[] {
    return favorites.value.filter((f) => f.pisteIds.includes(pisteId))
  }

  function pisteById(id: PisteId): Piste | undefined {
    return pistes.value.find((p) => p.id === id)
  }

  function favoriById(id: ArticleId): Favori | undefined {
    return favorites.value.find((f) => f.articleId === id)
  }

  /** Pistes dérivées d'une note d'article (via l'association du favori cible). */
  function derivedPistesOfNote(note: Note): PisteId[] {
    if (note.kind !== 'fav') return []
    if (note.derivedPisteIds) return note.derivedPisteIds
    const fav = favoriById(note.targetId as ArticleId)
    return fav ? fav.pisteIds : []
  }

  const currentPiste = computed<Piste | null>(() =>
    currentPisteId.value ? pisteById(currentPisteId.value) ?? null : null,
  )

  const filteredFavorites = computed<Favori[]>(() => {
    let list = favorites.value
    if (favFilter.value.kind === 'unassigned') {
      list = list.filter((f) => f.pisteIds.length === 0)
    } else if (favFilter.value.kind === 'piste') {
      const pid = favFilter.value.id
      list = list.filter((f) => f.pisteIds.includes(pid))
    }
    const q = fold(favSearch.value.trim())
    if (q) {
      list = list.filter(
        (f) => fold(f.titre).includes(q) || fold(f.source).includes(q) || fold(f.extrait).includes(q),
      )
    }
    return list
  })

  // ---- Chargement -----------------------------------------------------------
  async function load() {
    // Pas de court-circuit sur `loaded` : on re-fetche à chaque ouverture de la section
    // pour refléter les favoris ajoutés ailleurs (briefing, page article) entre-temps.
    loading.value = true
    try {
      if (USE_MOCK) {
        const m = await import('../mocks/memoire')
        favorites.value = m.MOCK_FAVORITES.map((f) => ({ ...f, pisteIds: [...f.pisteIds] }))
        pistes.value = m.MOCK_PISTES.map((p) => ({ ...p }))
        notes.value = m.MOCK_NOTES.map((n) => ({ ...n }))
      } else {
        const [favs, ps, ns] = await Promise.all([
          memoireApi.fetchFavorites(),
          memoireApi.fetchPistes(),
          memoireApi.fetchNotes(),
        ])
        favorites.value = favs
        pistes.value = ps
        notes.value = ns
      }
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  // ---- Navigation -----------------------------------------------------------
  function goFavoris() {
    screen.value = 'favoris'
  }
  function goPistes() {
    screen.value = 'pistes'
  }
  function goNotes() {
    screen.value = 'notes'
  }
  function openFiche(id: PisteId) {
    currentPisteId.value = id
    screen.value = 'fiche'
  }
  function openComposer(id: PisteId | null) {
    composerDraftId.value = id
    currentPisteId.value = id
    screen.value = 'composer'
  }

  // ---- Association favori ↔ piste (optimiste + rollback) --------------------
  async function toggleAssociation(articleId: ArticleId, pisteId: PisteId) {
    const fav = favoriById(articleId)
    if (!fav) return
    const piste = pisteById(pisteId)
    const snapshot = [...fav.pisteIds]
    const isAssociated = fav.pisteIds.includes(pisteId)

    // Mutation optimiste locale.
    fav.pisteIds = isAssociated
      ? fav.pisteIds.filter((id) => id !== pisteId)
      : [...fav.pisteIds, pisteId]

    try {
      if (!USE_MOCK) {
        if (isAssociated) await memoireApi.dissociate(pisteId, articleId)
        else await memoireApi.associate(pisteId, articleId)
      }
      toast(
        isAssociated
          ? `Dissocié de « ${piste?.nom ?? 'la piste'} »`
          : `Associé à « ${piste?.nom ?? 'la piste'} »`,
      )
    } catch {
      fav.pisteIds = snapshot // rollback
      toast('Échec — réessayez')
    }
  }

  // ---- Pistes : création / édition ------------------------------------------
  async function createPiste(input: {
    nom: string
    couleur: PisteColor
    descriptif: string
  }): Promise<PisteId> {
    if (USE_MOCK) {
      const id = `p-new-${++mockSeq}` as PisteId
      pistes.value = [...pistes.value, { id, favoriCount: 0, ...input }]
      toast(`Piste « ${input.nom} » créée`)
      return id
    }
    const created = await memoireApi.createPiste(input)
    pistes.value = [...pistes.value, created]
    toast(`Piste « ${created.nom} » créée`)
    return created.id
  }

  async function updatePiste(
    id: PisteId,
    input: { nom?: string; couleur?: PisteColor; descriptif?: string },
  ) {
    const piste = pisteById(id)
    if (!piste) return
    const snapshot = { ...piste }
    Object.assign(piste, input)
    try {
      if (!USE_MOCK) await memoireApi.patchPiste(id, input)
      toast('Piste mise à jour')
    } catch {
      Object.assign(piste, snapshot)
      toast('Échec — réessayez')
    }
  }

  // ---- Notes : édition / suppression (création hors onglet Notes) -----------
  async function addNote(kind: 'fav' | 'piste', targetId: string, texte: string) {
    if (USE_MOCK) {
      const id = `n-new-${++mockSeq}` as NoteId
      notes.value = [
        { id, kind, targetId, texte, createdAt: nowIso(), updatedAt: nowIso() },
        ...notes.value,
      ]
    } else {
      const created = await memoireApi.createNote({ kind, targetId, texte })
      notes.value = [created, ...notes.value]
    }
    if (kind === 'fav') {
      const fav = favoriById(targetId as ArticleId)
      if (fav) fav.hasNotes = true
    }
  }

  async function updateNote(id: NoteId, texte: string) {
    const note = notes.value.find((n) => n.id === id)
    if (!note) return
    const snapshot = note.texte
    note.texte = texte
    note.updatedAt = nowIso()
    try {
      if (!USE_MOCK) await memoireApi.patchNote(id, texte)
    } catch {
      note.texte = snapshot
      toast('Échec — réessayez')
    }
  }

  async function deleteNote(id: NoteId) {
    const idx = notes.value.findIndex((n) => n.id === id)
    if (idx < 0) return
    const [removed] = notes.value.splice(idx, 1)
    try {
      if (!USE_MOCK) await memoireApi.deleteNote(id)
      if (removed.kind === 'fav') {
        const fav = favoriById(removed.targetId as ArticleId)
        if (fav) fav.hasNotes = notes.value.some((n) => n.kind === 'fav' && n.targetId === fav.articleId)
      }
    } catch {
      notes.value.splice(idx, 0, removed)
      toast('Échec — réessayez')
    }
  }

  // ---- Aperçu vivant --------------------------------------------------------
  async function fetchApercu(descriptif: string, signal?: AbortSignal): Promise<Apercu> {
    if (USE_MOCK) {
      const { computeApercu } = await import('../mocks/memoire')
      return computeApercu(descriptif)
    }
    return memoireApi.fetchApercu(descriptif, signal)
  }

  async function computeThemeSpread(descriptif: string): Promise<number> {
    const { themeSpread } = await import('../mocks/memoire')
    return themeSpread(descriptif)
  }

  return {
    // état
    favorites, pistes, notes, loading, loaded,
    screen, currentPisteId, composerDraftId,
    favFilter, favSearch, notesSearch, notesGrouping,
    toastMessage,
    // dérivés
    favoriCounts, unassignedCount, currentPiste, filteredFavorites,
    favorisOf, pisteById, favoriById, derivedPistesOfNote,
    // actions
    load, toast,
    goFavoris, goPistes, goNotes, openFiche, openComposer,
    toggleAssociation, createPiste, updatePiste,
    addNote, updateNote, deleteNote,
    fetchApercu, computeThemeSpread,
  }
})

// Repli accent-insensible (utilitaire local au store).
function fold(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}
