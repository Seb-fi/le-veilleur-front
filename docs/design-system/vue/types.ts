/**
 * Le Veilleur — Design System
 * vue/types.ts
 *
 * Types métier pour la "Mémoire active". Reflètent la
 * spécification produit : pistes, traces (articles/notes/évènements),
 * et liens entre pistes.
 *
 * Ces types sont volontairement minces — les vrais modèles backend
 * porteront davantage de méta (auteur, scoring, embeddings, …).
 * Ici on ne capture que ce qui est nécessaire pour le rendu.
 */

// ---------------------------------------------------------------
// Identifiants opaques — éviter les confusions entre IDs
// ---------------------------------------------------------------
export type PisteId   = string & { readonly __brand: "PisteId" };
export type ArticleId = string & { readonly __brand: "ArticleId" };
export type NoteId    = string & { readonly __brand: "NoteId" };
export type EventId   = string & { readonly __brand: "EventId" };

// ---------------------------------------------------------------
// Piste — un fil de pensée que l'utilisateur suit dans le temps
// ---------------------------------------------------------------
export type PisteStatus = "active" | "dormant" | "emerging" | "tension";

export interface Piste {
  id: PisteId;
  title: string;
  /** Sous-titre : "axe · IA agents", "axe · régulation", etc. */
  axis?: string;
  /** Tags libres (par ex. "tension active", "12 jours") */
  tags?: string[];
  status: PisteStatus;
  /** Auteur de la piste : `user` (vous) ou `system` (détectée) */
  origin: "user" | "system";
  /** Date d'ouverture ISO. */
  openedAt: string;
  /** Nombre de traces (calculé côté backend). */
  traceCount: number;
  /** Liaisons explicites vers d'autres pistes. */
  linkedPisteIds?: PisteId[];
  /** ID de la note épinglée centrale, si elle existe. */
  pinnedNoteId?: NoteId;
  /** Position semi-stable dans le graphe (computed/persisted). */
  graphPosition?: { x: number; y: number };
}

// ---------------------------------------------------------------
// Article — article sauvegardé en favoris
// ---------------------------------------------------------------
export interface Article {
  id: ArticleId;
  title: string;
  source: string;
  publishedAt?: string;
  savedAt: string;
  /** Pistes auxquelles l'article est rattaché (0..n). */
  pisteIds: PisteId[];
  /** Note utilisateur attachée à l'article ("votre angle"). */
  userNote?: string;
  /** URL d'origine. */
  url?: string;
}

// ---------------------------------------------------------------
// Note — réflexion personnelle, libre ou rattachée
// ---------------------------------------------------------------
export interface Note {
  id: NoteId;
  body: string;
  createdAt: string;
  updatedAt?: string;
  /** Piste de rattachement. */
  pisteId?: PisteId;
  /** Entité de rattachement (article ou évènement). */
  attachedTo?:
    | { type: "article"; id: ArticleId }
    | { type: "event";   id: EventId };
  /** Note épinglée (centerpiece de sa piste). */
  pinned: boolean;
}

// ---------------------------------------------------------------
// Évènement — fait externe daté
// ---------------------------------------------------------------
export type EventKind = "announce" | "regulatory" | "release" | "geopolitical";

export interface DomainEvent {
  id: EventId;
  name: string;
  kind: EventKind;
  occurredAt: string;
  source?: string;
  /** Pistes auxquelles l'évènement est rattaché. */
  pisteIds: PisteId[];
}

// ---------------------------------------------------------------
// Traces — union pour le stream chronologique
// ---------------------------------------------------------------
export type TraceKind = "note" | "article" | "event";

export type Trace =
  | (Note         & { kind: "note" })
  | (Article      & { kind: "article" })
  | (DomainEvent  & { kind: "event" });

// ---------------------------------------------------------------
// Graph — modèle dérivé pour le rendu
// ---------------------------------------------------------------
export type GraphEdgeKind = "user" | "implicit" | "system";

export interface GraphEdge {
  fromPisteId: PisteId;
  toPisteId:   PisteId;
  kind: GraphEdgeKind;
  /** Score de proximité (0..1) — facultatif. */
  weight?: number;
}

export interface GraphSatellite {
  /** ID de l'entité (article, note, event). */
  id: string;
  kind: TraceKind;
  label: string;
  meta?: string;
  /** Position calculée (cluster-relative). */
  x: number;
  y: number;
  pinned?: boolean;
}

export interface GraphCluster {
  piste: Piste;
  satellites: GraphSatellite[];
}

// ---------------------------------------------------------------
// Drag & drop — décision de l'utilisateur
// ---------------------------------------------------------------
export type DropDecision = "move" | "link" | "cancel";

export interface PendingDrop {
  articleId: ArticleId;
  sourcePisteId: PisteId | null;
  targetPisteId: PisteId;
}

// ---------------------------------------------------------------
// Popover — état générique
// ---------------------------------------------------------------
export interface PopoverPosition { x: number; y: number; }

export type PopoverContext =
  | { type: "empty";   svgPoint: { x: number; y: number } }
  | { type: "entity";  entityKind: "article" | "event"; entityId: string; label: string }
  | { type: "note";    noteId: NoteId; label: string }
  | { type: "picker";  pisteId: PisteId };
