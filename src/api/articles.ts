import { api } from './client'
import { adaptArticle, type ArticleOut, type ExplorerArticle } from './explorer'

// Contexte éditorial — l'enum back (analysis|news|research|product) est mappé en libellé
// FR pour l'affichage (PRD §6.1 métriques). `central` (mock legacy) toléré.
export type ArticleContext = 'analysis' | 'news' | 'research' | 'product'
const CONTEXT_FR: Record<string, string> = {
  analysis: 'Analyse',
  news: 'Actualité',
  research: 'Recherche',
  product: 'Produit',
}
export function contextLabel(context: string): string {
  return CONTEXT_FR[context] ?? ''
}

// Détail d'article = ExplorerArticle (mapping partagé) + champs additionnels du détail.
export interface ArticleDetail extends ExplorerArticle {
  context: string
  contextLabel: string
  trending: boolean
  labels: string[]
  relatedIds: string[]
  published: string // ISO brut (date = libellé d'affichage)
  thesisFr: string | null
  isArgumentative: boolean
  contradictionIds: string[]
  contradictionScores: number[]
  fullText: string | null // PRD §7 : hasFull = !!fullText
}

export function adaptDetail(a: ArticleOut): ArticleDetail {
  return {
    ...adaptArticle(a),
    context: a.context,
    contextLabel: contextLabel(a.context),
    trending: a.trending,
    labels: a.labels,
    relatedIds: a.related_ids,
    published: a.published,
    thesisFr: a.thesis_fr ?? null,
    isArgumentative: a.is_argumentative ?? false,
    contradictionIds: a.contradiction_ids ?? [],
    contradictionScores: a.contradiction_scores ?? [],
    fullText: a.full_text ?? null,
  }
}

export function fetchArticle(id: string): Promise<ArticleDetail> {
  return api.get<ArticleOut>(`/articles/${encodeURIComponent(id)}`).then(adaptDetail)
}

// Appartenance aux clusters → libellé de sujet (max similarité).
export interface ClusterMembership {
  cluster_id: number
  label: string | null
  max_similarity: number
}

export function fetchArticleClusters(id: string): Promise<ClusterMembership[]> {
  return api.get<ClusterMembership[]>(`/articles/${encodeURIComponent(id)}/clusters`)
}

// score-detail : on ne lit QUE la justification narrative (« pourquoi pour vous »).
// Le reste (signaux bruts) est du dev, ignoré côté front éditorial.
export interface ScoreDetailResult {
  available: boolean
  score_detail?: { reranker_justification?: string } & Record<string, unknown>
}

export function fetchScoreDetail(id: string): Promise<ScoreDetailResult> {
  return api.get<ScoreDetailResult>(`/articles/${encodeURIComponent(id)}/score-detail`)
}

// Entités résolues d'un article (« Acteurs & notions », PRD §6.1) — `label` peut être
// nul (entité non labellisée) : on masque alors la puce côté UI.
export interface ArticleEntityOut {
  entity_id: string
  label: string | null
}
export interface ArticleEntity {
  id: string
  label: string
}

export function fetchArticleEntities(id: string): Promise<ArticleEntity[]> {
  return api
    .get<ArticleEntityOut[]>(`/articles/${encodeURIComponent(id)}/entities`)
    .then((rows) =>
      rows
        .filter((e): e is ArticleEntityOut & { label: string } => !!e.label && !!e.label.trim())
        .map((e) => ({ id: e.entity_id, label: e.label })),
    )
}
