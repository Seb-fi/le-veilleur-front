// Client API « Mémoire active » — frontière avec le back (PRD §9, identique au PRD back §8).
// Le wire est en snake_case ; on mappe vers les types camelCase de `src/types` ici, à la
// frontière, pour que le reste de l'app ne connaisse que le modèle métier.

import { api } from './client'
import type {
  Favori, Piste, PisteId, PisteColor, Note, NoteId, NoteAnchor, ArticleId, Apercu, ApercuState,
} from '../types'

// ----------------------------------------------------------------------------
// DTO (wire) — snake_case, miroir exact du contrat §9
// ----------------------------------------------------------------------------
interface FavoriDTO {
  article_id: string
  titre: string
  source: string
  date: string
  lien: string
  extrait: string
  piste_ids: string[]
  has_notes: boolean
}
interface PisteListDTO {
  id: string
  nom: string
  couleur: PisteColor
  descriptif: string
  favori_count: number
}
interface PisteDetailDTO {
  id: string
  nom: string
  couleur: PisteColor
  descriptif: string
  favoris: { article_id: string; titre: string; source: string; date: string }[]
  notes: { id: string; texte: string; created_at: string; updated_at: string }[]
}
// Ancre wire (snake_case) — miroir du contrat back §9.1.
interface NoteAnchorDTO {
  quote: string
  offset: number
  mode: 'resume' | 'full'
  paragraph_text: string
  paragraph_index: number
}
interface NoteDTO {
  id: string
  kind: 'fav' | 'piste'
  target_id: string
  texte: string
  created_at: string
  updated_at: string
  derived_piste_ids?: string[]
  anchor?: NoteAnchorDTO | null
}
interface ApercuDTO {
  results: { article_id: string; titre: string; source: string; date: string; score: number }[]
  state: ApercuState
  score_stats: { n: number; top: number; mean: number; dispersion: number }
}

// ----------------------------------------------------------------------------
// Mappers DTO → modèle
// ----------------------------------------------------------------------------
function toFavori(d: FavoriDTO): Favori {
  return {
    articleId: d.article_id as ArticleId,
    titre: d.titre,
    source: d.source,
    date: d.date,
    lien: d.lien,
    extrait: d.extrait,
    pisteIds: d.piste_ids as PisteId[],
    hasNotes: d.has_notes,
  }
}
function toPiste(d: PisteListDTO): Piste {
  return {
    id: d.id as PisteId,
    nom: d.nom,
    couleur: d.couleur,
    descriptif: d.descriptif,
    favoriCount: d.favori_count,
  }
}
function toNoteAnchor(a: NoteAnchorDTO): NoteAnchor {
  return {
    quote: a.quote,
    offset: a.offset,
    mode: a.mode,
    paragraphText: a.paragraph_text,
    paragraphIndex: a.paragraph_index,
  }
}
function fromNoteAnchor(a: NoteAnchor): NoteAnchorDTO {
  return {
    quote: a.quote,
    offset: a.offset,
    mode: a.mode,
    paragraph_text: a.paragraphText,
    paragraph_index: a.paragraphIndex,
  }
}
function toNote(d: NoteDTO): Note {
  return {
    id: d.id as NoteId,
    kind: d.kind,
    targetId: d.target_id,
    texte: d.texte,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    derivedPisteIds: d.derived_piste_ids as PisteId[] | undefined,
    anchor: d.anchor ? toNoteAnchor(d.anchor) : undefined,
  }
}
function toApercu(d: ApercuDTO): Apercu {
  return {
    results: d.results.map((r) => ({
      articleId: r.article_id as ArticleId,
      titre: r.titre,
      source: r.source,
      date: r.date,
      score: r.score,
    })),
    state: d.state,
    scoreStats: d.score_stats,
  }
}

// Détail de piste : favoris (forme légère) + notes de piste (kind='piste').
export interface PisteDetail {
  piste: Piste
  favoris: { articleId: ArticleId; titre: string; source: string; date: string }[]
  notes: Note[]
}

// ----------------------------------------------------------------------------
// Favoris
// ----------------------------------------------------------------------------
export async function fetchFavorites(): Promise<Favori[]> {
  const dto = await api.get<FavoriDTO[]>('/memoire/favorites')
  return dto.map(toFavori)
}
export async function createFavorite(articleId: ArticleId): Promise<void> {
  await api.post<void>('/memoire/favorites', { article_id: articleId })
}
export async function deleteFavorite(articleId: ArticleId): Promise<void> {
  await api.del(`/memoire/favorites/${encodeURIComponent(articleId)}`)
}

// ----------------------------------------------------------------------------
// Pistes
// ----------------------------------------------------------------------------
export async function fetchPistes(): Promise<Piste[]> {
  const dto = await api.get<PisteListDTO[]>('/memoire/pistes')
  return dto.map(toPiste)
}
export async function fetchPiste(id: PisteId): Promise<PisteDetail> {
  const d = await api.get<PisteDetailDTO>(`/memoire/pistes/${encodeURIComponent(id)}`)
  return {
    piste: {
      id: d.id as PisteId,
      nom: d.nom,
      couleur: d.couleur,
      descriptif: d.descriptif,
      favoriCount: d.favoris.length,
    },
    favoris: d.favoris.map((f) => ({
      articleId: f.article_id as ArticleId,
      titre: f.titre,
      source: f.source,
      date: f.date,
    })),
    notes: d.notes.map((n) => ({
      id: n.id as NoteId,
      kind: 'piste' as const,
      targetId: d.id,
      texte: n.texte,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    })),
  }
}
export async function createPiste(input: {
  nom: string
  couleur: PisteColor
  descriptif: string
}): Promise<Piste> {
  const d = await api.post<PisteListDTO>('/memoire/pistes', input)
  return toPiste(d)
}
export async function patchPiste(
  id: PisteId,
  input: { nom?: string; couleur?: PisteColor; descriptif?: string },
): Promise<void> {
  await api.patch<void>(`/memoire/pistes/${encodeURIComponent(id)}`, input)
}
export async function deletePiste(id: PisteId): Promise<void> {
  await api.del(`/memoire/pistes/${encodeURIComponent(id)}`)
}

// ----------------------------------------------------------------------------
// Association favori ↔ piste (idempotente)
// ----------------------------------------------------------------------------
export async function associate(pisteId: PisteId, articleId: ArticleId): Promise<void> {
  await api.post<void>(
    `/memoire/pistes/${encodeURIComponent(pisteId)}/favorites/${encodeURIComponent(articleId)}`,
  )
}
export async function dissociate(pisteId: PisteId, articleId: ArticleId): Promise<void> {
  await api.del(
    `/memoire/pistes/${encodeURIComponent(pisteId)}/favorites/${encodeURIComponent(articleId)}`,
  )
}

// ----------------------------------------------------------------------------
// Notes
// ----------------------------------------------------------------------------
export async function fetchNotes(): Promise<Note[]> {
  const dto = await api.get<NoteDTO[]>('/memoire/notes')
  return dto.map(toNote)
}
export async function createNote(input: {
  kind: 'fav' | 'piste'
  targetId: string
  texte: string
  anchor?: NoteAnchor
}): Promise<Note> {
  const d = await api.post<NoteDTO>('/memoire/notes', {
    kind: input.kind,
    target_id: input.targetId,
    texte: input.texte,
    // L'ancre n'est envoyée que si présente (commentaire de sélection, PRD §9.1).
    ...(input.anchor ? { anchor: fromNoteAnchor(input.anchor) } : {}),
  })
  return toNote(d)
}
export async function patchNote(id: NoteId, texte: string): Promise<void> {
  await api.patch<void>(`/memoire/notes/${encodeURIComponent(id)}`, { texte })
}
export async function deleteNote(id: NoteId): Promise<void> {
  await api.del(`/memoire/notes/${encodeURIComponent(id)}`)
}

// ----------------------------------------------------------------------------
// Aperçu vivant
// ----------------------------------------------------------------------------
export async function fetchApercu(descriptif: string, signal?: AbortSignal): Promise<Apercu> {
  const d = await api.post<ApercuDTO>('/memoire/apercu', { descriptif }, signal)
  return toApercu(d)
}
