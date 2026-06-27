/**
 * Le Veilleur — Design System
 * vue/types.ts
 *
 * Types métier de la « Mémoire active » (MVP refondu : favori · piste · note ·
 * favori↔piste). Aligné sur PRD_memoire_active_front.md §8. Les anciens types
 * (PisteStatus, DomainEvent, Graph*, Drop*, Trace, EventId…) ont été retirés
 * avec l'ancienne section (graphe / statut / events).
 *
 * Référence pour la doc DS ; le code applicatif importe depuis `src/types`.
 */

// ---------------------------------------------------------------
// Identifiants opaques — éviter les confusions entre IDs
// ---------------------------------------------------------------
export type PisteId = string & { readonly __brand: 'PisteId' }
export type NoteId = string & { readonly __brand: 'NoteId' }
export type ArticleId = string & { readonly __brand: 'ArticleId' }

// ---------------------------------------------------------------
// Couleur de piste — token mappé sur var(--color-{couleur})
// ---------------------------------------------------------------
export type PisteColor = 'indigo' | 'moss' | 'amber' | 'rose' | 'steel'

// ---------------------------------------------------------------
// Favori — article sauvegardé, associable à 0..n pistes
// ---------------------------------------------------------------
export interface Favori {
  articleId: ArticleId
  titre: string
  source: string
  date: string
  lien: string
  extrait: string
  /** Associations many-to-many (source de vérité du lien). */
  pisteIds: PisteId[]
  hasNotes: boolean
}

// ---------------------------------------------------------------
// Piste — axe de recherche rédigé par l'utilisateur
// ---------------------------------------------------------------
export interface Piste {
  id: PisteId
  nom: string
  couleur: PisteColor
  descriptif: string
  favoriCount: number
}

// ---------------------------------------------------------------
// Note — polymorphe : cible un favori (kind='fav') ou une piste (kind='piste')
// ---------------------------------------------------------------
export interface Note {
  id: NoteId
  kind: 'fav' | 'piste'
  /** article_id si kind==='fav', piste_id si kind==='piste'. */
  targetId: string
  texte: string
  createdAt: string
  updatedAt: string
  /** Pistes dérivées (jamais stockées) — présent seulement si kind==='fav'. */
  derivedPisteIds?: PisteId[]
}

// ---------------------------------------------------------------
// Aperçu vivant — descriptif → résultats (retrieval back-end)
// ---------------------------------------------------------------
export type ApercuState = 'AUCUNE_SOURCE' | 'SIGNAL_FAIBLE' | 'SIGNAL_NET'

export interface ApercuResult {
  articleId: ArticleId
  titre: string
  source: string
  date: string
  score: number
}

export interface Apercu {
  /** score >= preview_floor ; [] possible. */
  results: ApercuResult[]
  /** seule entrée de la jauge. */
  state: ApercuState
  /** dispersion = observabilité uniquement. */
  scoreStats: { n: number; top: number; mean: number; dispersion: number }
}
