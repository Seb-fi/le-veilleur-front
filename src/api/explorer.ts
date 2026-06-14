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
  return api.get<ArticlesPage>(`/articles${query ? '?' + query : ''}`)
}

export function fetchTopics(): Promise<Topic[]> {
  return api.get<Topic[]>('/topics')
}

export function fetchCarto(): Promise<CartoData> {
  return api.get<CartoData>('/topics/carto')
}
