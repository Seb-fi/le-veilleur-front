import { api } from './client'
import { adaptArticle, type ArticleOut, type ExplorerArticle } from './explorer'

// Détail d'article = ExplorerArticle (mapping partagé) + champs additionnels du détail.
export interface ArticleDetail extends ExplorerArticle {
  context: string
  trending: boolean
  labels: string[]
  relatedIds: string[]
  published: string // ISO brut (date = libellé d'affichage)
}

export function adaptDetail(a: ArticleOut): ArticleDetail {
  return {
    ...adaptArticle(a),
    context: a.context,
    trending: a.trending,
    labels: a.labels,
    relatedIds: a.related_ids,
    published: a.published,
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
