import { api } from './client'

export interface Thread {
  name: string
  status: 'shift' | 'rising' | 'steady' | 'deep'
  statusLabel: string
  daysTracked: number
  articleCount: number
  sparkPoints: number[]
}

export interface BriefingArticle {
  id: string
  title: string
  source: string
  date: string
  score: number
  why: string
  axis: string
  axisClass: 'indigo' | 'amber' | 'moss' | 'rose'
  type: string
  summary: string
  img: string
  relatedCount?: number
}

export interface Breve {
  kind: 'cyber' | 'annonce' | 'geo' | 'marche'
  kindLabel: string
  time: string
  title: string
  source: string
  category: string
}

export interface FaibleItem {
  where: string
  body: string
}

export interface PrevBriefing {
  date: string
  edition: number
  title: string
  duration: string
  articleCount: number
  listened: boolean
}

export interface Dossier {
  category: string
  headline: string
  img: string
  imgCaption: string
  lede: string
  sourceLabel: string
  sourceCount: number
  readTime: number
  synthesis: string
  tensions: string
  matters: string
  relatedCount: number
}

export interface BriefingData {
  edition: number
  date: string
  time: string
  greetingName: string
  sourcesScanned: number
  signalCount: number
  readMinutes: number
  activeThread: { topic: string; days: number; shift: string }
  audioTitle: string
  audioDuration: string
  audioSize: string
  threads: Thread[]
  // Dossier éditorial : pas de source structurée tant que l'endpoint éditorial S1
  // n'existe pas (Couche C = narration audio). null → carte omise (jamais moqué).
  dossier: Dossier | null
  alsoArticles: BriefingArticle[]
  breves: Breve[]
  faibles: FaibleItem[]
  prevBriefings: PrevBriefing[]
}

// ── Contrats backend (docs/openapi.json) ──────────────────────────────────────
interface BriefingOut {
  id: string
  date: string
  date_label: string
  article_ids: string[]
  article_count: number
  has_audio: boolean
  audio_url: string | null
}

interface ArticleOut {
  id: string
  title: string
  summary: string
  labels: string[]
  content_type: string
  source: string
  published: string
  score: number | null
  related_ids: string[]
}

const AXIS_CLASSES = ['indigo', 'amber', 'moss', 'rose'] as const
function axisClassFor(key: string): BriefingArticle['axisClass'] {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return AXIS_CLASSES[h % AXIS_CLASSES.length]
}

function adaptBriefingArticle(a: ArticleOut): BriefingArticle {
  const primary = a.labels[0] ?? ''
  const human = primary.replace(/[_-]+/g, ' ').trim()
  return {
    id: a.id,
    title: a.title,
    source: a.source,
    date: a.published,
    score: a.score ?? 0,
    why: '', // pertinence relative au profil absente du backend
    axis: human ? human.charAt(0).toUpperCase() + human.slice(1) : 'Veille',
    axisClass: axisClassFor(primary),
    type: a.content_type,
    summary: a.summary,
    img: '', // pas de miniature dans ArticleOut
    relatedCount: a.related_ids.length,
  }
}

export function fetchBriefingTodayRaw(): Promise<BriefingOut> {
  return api.get<BriefingOut>('/briefings/today')
}

export function fetchBriefingArticle(id: string): Promise<BriefingArticle> {
  return api.get<ArticleOut>(`/articles/${encodeURIComponent(id)}`).then(adaptBriefingArticle)
}

export function fetchPrevBriefings(): Promise<PrevBriefing[]> {
  return api.get<BriefingOut[]>('/briefings').then((rows) =>
    rows.map((b, i) => ({
      date: b.date_label,
      edition: rows.length - i, // numéro d'édition non suivi backend → ordinal décroissant
      title: '',
      duration: '',
      articleCount: b.article_count,
      listened: false,
    })),
  )
}
