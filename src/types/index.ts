// Types métier de la « Mémoire active » (modèle MVP : favori · piste · note · favori↔piste).
// Source de vérité : PRD_memoire_active_front.md §8. Les anciens types (PisteStatus,
// DomainEvent, Graph*, Drop*, Trace, EventId…) ont été retirés avec l'ancienne section.

export type PisteId = string & { readonly __brand: 'PisteId' }
export type NoteId = string & { readonly __brand: 'NoteId' }
export type ArticleId = string & { readonly __brand: 'ArticleId' }

export type PisteColor = 'indigo' | 'moss' | 'amber' | 'rose' | 'steel'

export interface Favori {
  articleId: ArticleId
  titre: string
  source: string
  date: string
  lien: string
  extrait: string
  pisteIds: PisteId[] // associations (source de vérité du lien)
  hasNotes: boolean
}

export interface Piste {
  id: PisteId
  nom: string
  couleur: PisteColor
  descriptif: string
  favoriCount: number
}

// Ancre d'un commentaire de sélection (PRD §3, gate (a)/(b)). Optionnelle : une note
// d'article simple a `anchor` nul ; un commentaire ancré porte `anchor` non nul + kind='fav'.
// Mono-paragraphe au MVP. On stocke le brut (texte de l'article), jamais aucun dérivé.
export interface NoteAnchor {
  quote: string
  offset: number
  mode: 'resume' | 'full'
  paragraphText: string
  paragraphIndex: number
}

export interface Note {
  id: NoteId
  kind: 'fav' | 'piste'
  targetId: string // article_id si kind==='fav', piste_id si kind==='piste'
  texte: string
  createdAt: string
  updatedAt: string
  derivedPisteIds?: PisteId[] // présent seulement si kind==='fav' (dérivé back)
  anchor?: NoteAnchor // présent seulement pour un commentaire de sélection (PRD §3)
}

export type ApercuState = 'AUCUNE_SOURCE' | 'SIGNAL_FAIBLE' | 'SIGNAL_NET'

export interface ApercuResult {
  articleId: ArticleId
  titre: string
  source: string
  date: string
  score: number
}

export interface Apercu {
  results: ApercuResult[] // score >= preview_floor ; [] possible
  state: ApercuState // seule entrée de la jauge
  scoreStats: { n: number; top: number; mean: number; dispersion: number } // dispersion = observabilité only
}
