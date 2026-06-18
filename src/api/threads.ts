import { api } from './client'

// Fils d'émergence « Ce que le système suit pour vous » (PRD threads, SHADOW).
// Surface lecture seule, per-user (#49). Contrat = src/api/routes/threads.py (S2).

export interface ThreadOut {
  thread_id: string
  kind: string
  anchor: string
  name: string
  status: string
  status_label: string
  days_tracked: number
  article_count: number
  source_count: number
  claim_count: number
  burst?: number | null
  emergence_score?: number | null
  is_emerging: boolean
  spark_kind: string
  spark_points: number[]
}

export interface ThreadsEnvelope {
  threads: ThreadOut[]
  cold_start: boolean
  degenerate: boolean
  surveilled_count: number
  note: string | null
}

export interface SourceOut {
  article_id: string
  title: string | null
  link: string | null
  source: string | null
  published: string | null
}

export interface ClaimOut {
  claim_text: string
  claim_type: string | null
}

export interface ThreadDetail extends ThreadOut {
  claims: ClaimOut[]
  sources: SourceOut[]
}

export function fetchThreads(k = 4): Promise<ThreadsEnvelope> {
  return api.get<ThreadsEnvelope>(`/threads?k=${k}`)
}

export function fetchThreadDetail(threadId: string): Promise<ThreadDetail> {
  return api.get<ThreadDetail>(`/threads/${encodeURIComponent(threadId)}`)
}

// Bandeau « ce que le système suit pour vous » alimenté par les fils CARVÉS gatés
// (Phase 2, scoping A + gate de cohésion). Contrat = src/api/routes/threads.py:CarvedBandEnvelope.
export interface CarvedFil {
  dossier_id: string
  anchor: string
  column_label: string
  name: string
  source_count: number | null
  burst: number | null
  cohesion: number | null
  cohesion_penalty: number | null
  gated_score: number | null
  is_emerging: boolean
  sources: SourceOut[]
}

export interface CarvedBandEnvelope {
  fils: CarvedFil[]
  cold_start: boolean
  degenerate: boolean
  surveilled_count: number
  note: string | null
}

export function fetchCarved(k = 4): Promise<CarvedBandEnvelope> {
  return api.get<CarvedBandEnvelope>(`/threads/carved?k=${k}`)
}
