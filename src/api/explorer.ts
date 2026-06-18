import { api } from './client'

export type AxisClass = 'indigo' | 'amber' | 'moss' | 'rose'

export interface ExplorerArticle {
  id: string
  title: string
  source: string
  date: string
  score: number
  why: string
  axis: string
  axisClass: AxisClass
  type: string
  summary: string
  img: string
  link?: string
  relatedCount: number
}

export interface Topic {
  id: string
  name: string
  desc: string
  emergent: boolean
  articleCount: number
  axis: string
  axisClass: AxisClass
  maturity: number
  delta?: number
  trend: number[]
}

export interface CartoNode {
  id: string
  label: string
  size: number
  axis: string
  x: number
  y: number
  articles: string
  interest: 'high' | 'med' | 'low'
  desc: string
}

export type LinkStrength = 'strong' | 'medium' | 'weak'
export type CartoLink = [string, string, LinkStrength]

export interface CartoData {
  nodes: CartoNode[]
  links: CartoLink[]
}

export interface ArticlesPage {
  articles: ExplorerArticle[]
  total: number
}

// ── Contrats backend (docs/openapi.json) ──────────────────────────────────────
export interface ArticleOut {
  id: string
  title: string
  summary: string
  labels: string[]
  context: string
  content_type: string
  source: string
  published: string
  score: number | null
  trending: boolean
  related_ids: string[]
  thesis_fr?: string | null
  link?: string | null
  thumbnail_url?: string | null
  thumbnail_path?: string | null
}

// Le corpus contient des liens dégénérés (ex. "=") — on ne garde qu'une vraie URL.
export function safeUrl(v: string | null | undefined): string {
  return v && /^https?:\/\//i.test(v) ? v : ''
}

export function thumbOf(a: { thumbnail_url?: string | null; thumbnail_path?: string | null }): string {
  return safeUrl(a.thumbnail_url) || (a.thumbnail_path ?? '') || ''
}

interface TopicOut {
  id: number
  label: string | null
  summary: string | null
  article_count: number
  chunk_count: number
  trend_score: number
  is_emerging: boolean
  label_ready: boolean
  first_seen: string
  last_seen: string
}

interface ClusterHistoryOut {
  date: string
  article_count: number
  source_count: number
  trend_score: number
}

// ── Adapters ─────────────────────────────────────────────────────────────────
// La taxonomie d'axes per-profil (« Pro · Data », « Signaux faibles »…) est
// produite côté backend par S1 (Hydratation L2, _AXES per-profil) et n'est pas
// encore stabilisée. En attendant ce SYNC, on dérive un axe lisible depuis le
// premier label et une classe de couleur déterministe (variété visuelle stable).
const AXIS_CLASSES: AxisClass[] = ['indigo', 'amber', 'moss', 'rose']

function axisClassFor(key: string): AxisClass {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return AXIS_CLASSES[h % AXIS_CLASSES.length]
}

function humanizeLabel(label: string): string {
  const s = label.replace(/[_-]+/g, ' ').trim()
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}

export function adaptArticle(a: ArticleOut): ExplorerArticle {
  const primary = a.labels[0] ?? ''
  return {
    id: a.id,
    title: a.title,
    source: a.source,
    date: a.published,
    score: a.score ?? 0,
    // « Pourquoi pour vous » : champ de pertinence relative au profil — absent du
    // backend (thesis_fr ≠ pertinence). Laissé vide ; l'UI masque si absent.
    why: '',
    axis: humanizeLabel(primary) || 'Veille',
    axisClass: axisClassFor(primary),
    type: a.content_type,
    summary: a.summary,
    img: thumbOf(a),
    link: safeUrl(a.link),
    relatedCount: a.related_ids.length,
  }
}

function adaptTopic(t: TopicOut, trend: number[] = []): Topic {
  const key = t.label ?? String(t.id)
  return {
    id: String(t.id),
    name: t.label ?? `Sujet ${t.id}`,
    desc: t.summary ?? '',
    emergent: t.is_emerging,
    articleCount: t.article_count,
    axis: humanizeLabel(t.label ?? '') || 'Veille',
    axisClass: axisClassFor(key),
    // Maturité dérivée du volume (proxy ; pas de champ dédié backend).
    maturity: Math.min(1, t.article_count / 20),
    trend,
  }
}

export function fetchArticles(params?: {
  axis?: string
  sort?: string
  q?: string
  page?: number
}): Promise<ArticlesPage> {
  const qs = new URLSearchParams()
  if (params?.axis) qs.set('axis', params.axis)
  if (params?.sort) qs.set('sort', params.sort)
  if (params?.q) qs.set('q', params.q)
  if (params?.page) qs.set('page', String(params.page))
  const query = qs.toString()
  return api
    .get<ArticleOut[]>(`/articles${query ? '?' + query : ''}`)
    .then((rows) => ({ articles: rows.map(adaptArticle), total: rows.length }))
}

// Nombre de sujets dont on hydrate la sparkline (1 appel /history chacun).
const SPARKLINE_HYDRATE_LIMIT = 12

export async function fetchTopics(): Promise<Topic[]> {
  const rows = await api.get<TopicOut[]>('/topics')
  // Sparkline non fournie par le listing (trend_score scalaire) → hydratée via
  // /history pour les sujets les plus actifs uniquement (appels bornés).
  const toHydrate = [...rows]
    .sort((a, b) => b.trend_score - a.trend_score)
    .slice(0, SPARKLINE_HYDRATE_LIMIT)
  const trends = new Map<number, number[]>()
  await Promise.all(
    toHydrate.map(async (t) => {
      try {
        const hist = await api.get<ClusterHistoryOut[]>(`/topics/${t.id}/history`)
        trends.set(t.id, hist.map((h) => h.article_count))
      } catch {
        /* sparkline optionnelle : on dégrade silencieusement */
      }
    }),
  )
  return rows.map((t) => adaptTopic(t, trends.get(t.id) ?? []))
}

// Endpoint /topics/carto inexistant côté backend (interface review §3) : l'appel
// échoue et le store retombe sur le mock. Laissé tel quel jusqu'à création back.
export function fetchCarto(): Promise<CartoData> {
  return api.get<CartoData>('/topics/carto')
}
