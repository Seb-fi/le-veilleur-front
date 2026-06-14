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
  dossier: Dossier
  alsoArticles: BriefingArticle[]
  breves: Breve[]
  faibles: FaibleItem[]
  prevBriefings: PrevBriefing[]
}

export function fetchBriefingToday(): Promise<BriefingData> {
  return api.get<BriefingData>('/briefings/today')
}
